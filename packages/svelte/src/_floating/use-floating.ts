/**
 * useFloating — imperative popup positioning glue for Svelte overlays.
 * Portals the popup element to document.body, positions it with `position:fixed`
 * via core's pure `computePosition`, and keeps it aligned on scroll/resize.
 * All DOM/geometry work is imperative with explicit cleanup (red line #3):
 * callers run it inside `$effect` and return `destroy`.
 *
 * Pure positioning math lives in @chenzy-design/core (computePosition); this
 * file only measures rects, writes styles, wires listeners and the portal.
 */
import { computePosition, type Placement } from '@chenzy-design/core';

export interface UseFloatingOptions {
  placement: Placement;
  /** gap between trigger and popup (px) */
  offset?: number;
  /** flip to the opposite side on viewport overflow */
  autoAdjust?: boolean;
  /** min distance from the viewport edge (px) */
  padding?: number;
  /** set the popup's min-inline-size to the trigger width (Select-style dropdowns) */
  matchWidth?: boolean;
  /** point start/end-aligned arrows at the trigger center (default false) */
  arrowPointAtCenter?: boolean;
  /** distance (px) from the aligned edge to the arrow for start/end alignment */
  arrowEdgeDistance?: number;
  /**
   * Overlay mode (Semi `…Over` positions): cover the trigger instead of sitting
   * beside it — leading edges aligned, pulled back by `offset`, no flipping.
   */
  over?: boolean;
  /** called after each reposition with the resolved side/align + arrow offset */
  onPlacement?: (info: { placement: Placement; arrowOffset: number }) => void;
  /**
   * Custom mount container for the portaled popup. Defaults to document.body.
   * When it resolves to a non-body element the popup is positioned with
   * `position:absolute` relative to that container (offset by the container's
   * box + scroll), instead of the viewport-fixed positioning used for body.
   */
  getContainer?: (() => HTMLElement | null | undefined) | undefined;
  /**
   * Forward a synthetic click on the trigger whenever the popup content is
   * clicked (default false). The popup is portaled to `document.body`, so a
   * real click inside it bubbles up the *actual* DOM tree (body's ancestors),
   * never through the trigger's original subtree — unlike React, where Portal
   * content still bubbles through the *virtual* tree to ancestor components.
   * Svelte has no such virtual-tree bubbling, so callers that rely on "click
   * inside the popup should also count as clicking the trigger" (e.g.
   * Cascader's +N rest-tags popover reopening the panel) must opt in here.
   * Default off: most popup content (menu items, form controls) handles its
   * own click and would misfire if the trigger's click handler ran too (e.g.
   * Select's trigger toggles open/closed — forwarding would reopen it right
   * after an option selection closes it).
   */
  forwardClickToTrigger?: boolean;
}

export interface FloatingHandle {
  /** force a reposition (e.g. after content changes) */
  update: () => void;
  /** remove listeners and return the popup from the portal */
  destroy: () => void;
}

const SUPPORTS_DOM = typeof document !== 'undefined' && typeof window !== 'undefined';

/**
 * Mount `popup` into <body>, position it relative to `trigger`, and keep it
 * positioned until destroy(). Returns a no-op handle in non-DOM (SSR) contexts.
 */
export function useFloating(
  trigger: HTMLElement,
  popup: HTMLElement,
  options: UseFloatingOptions,
): FloatingHandle {
  if (!SUPPORTS_DOM) {
    return { update: () => {}, destroy: () => {} };
  }

  const {
    placement,
    offset = 8,
    autoAdjust = true,
    padding = 4,
    matchWidth = false,
    arrowPointAtCenter = false,
    arrowEdgeDistance,
    over = false,
    onPlacement,
    getContainer,
    forwardClickToTrigger = false,
  } = options;

  // portal: detach the popup from its in-flow parent and append to the custom
  // container (default <body>) so it escapes any `overflow:hidden` ancestor
  // clipping. A non-body container switches positioning to `position:absolute`
  // relative to that container (computePosition still works in viewport space;
  // we translate the result into the container's coordinate space below).
  const container = getContainer?.() ?? document.body;
  const useAbsolute = container !== document.body;
  container.appendChild(popup);
  popup.style.position = useAbsolute ? 'absolute' : 'fixed';
  popup.style.insetBlockStart = '0';
  popup.style.insetInlineStart = '0';
  popup.style.margin = '0';

  // forwardClickToTrigger: re-dispatch the click on the trigger so it travels
  // the trigger's *real* subtree (the portal broke the popup out of it). Guard
  // re-entrancy with a flag — the dispatched event is also a plain 'click', so
  // without it the listener would catch its own forwarded event and loop.
  // Deferred with queueMicrotask: dispatchEvent runs synchronously, so an
  // immediate forward would nest the trigger's full click handling (e.g.
  // Cascader's toggleOpen — a $state update + panel-open transition) inside
  // the *current* click's call stack, competing with this click's own
  // handling (the popup's hover-close transition) for the same animation
  // frame and producing visible jank. Deferring lets the real click finish
  // first so the two transitions don't fight over one frame.
  let forwarding = false;
  function onPopupClick() {
    if (forwarding) return;
    forwarding = true;
    queueMicrotask(() => {
      trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));
      forwarding = false;
    });
  }
  if (forwardClickToTrigger) {
    popup.addEventListener('click', onPopupClick);
  }

  let frame = 0;
  // Layout-size snapshot (trigger + popup) captured at the last position(). The
  // ResizeObserver re-positions only when one of these actually changed, so the
  // redundant observe frame is swallowed while a real reflow is not.
  let lastTriggerW = 0;
  let lastTriggerH = 0;
  let lastPopupW = 0;
  let lastPopupH = 0;

  // Layout extent of an element for the size comparison: offsetWidth/Height (the
  // un-scaled layout box, so an enter animation's transform: scale doesn't shrink
  // it) with a getBoundingClientRect fallback (jsdom reads offset* as 0).
  function extentOf(el: HTMLElement): { w: number; h: number } {
    const r = el.getBoundingClientRect();
    return { w: el.offsetWidth || r.width, h: el.offsetHeight || r.height };
  }

  function snapshotSizes(): void {
    const t = extentOf(trigger);
    const p = extentOf(popup);
    lastTriggerW = t.w;
    lastTriggerH = t.h;
    lastPopupW = p.w;
    lastPopupH = p.h;
  }

  function sizesChanged(): boolean {
    const t = extentOf(trigger);
    const p = extentOf(popup);
    return (
      t.w !== lastTriggerW ||
      t.h !== lastTriggerH ||
      p.w !== lastPopupW ||
      p.h !== lastPopupH
    );
  }

  function position() {
    // 浮层隐藏时（destroyOnClose=false 关闭态挂载 display:none）rect 全 0，
    // 此时定位会算出错误坐标并写死 transform(0,0)，之后即便可见也停在左上角。
    // 跳过隐藏态定位：等浮层可见（ResizeObserver 尺寸 0→实际 或 update 调用）再算。
    // 用 computed display 判定 display:none（jsdom 与浏览器均准确，且不依赖 layout 尺寸，
    // 避免在无布局环境把可见元素误判为隐藏）。
    if (typeof window !== 'undefined' && window.getComputedStyle(popup).display === 'none') return;
    const triggerRect = trigger.getBoundingClientRect();
    // match-width must be applied before measuring the popup so its rect (and
    // the cross-axis clamping below) reflects the trigger-derived width.
    if (matchWidth) {
      popup.style.minInlineSize = `${Math.round(triggerRect.width)}px`;
    }
    // core positions from the trigger rect + the popup's width/height only (it
    // never reads popupRect.x/y). Take the extent from offsetWidth/offsetHeight
    // (the un-scaled layout box) rather than the rect's width/height: the enter
    // animation applies transform: scale, so a mid-animation getBoundingClientRect
    // reports a shrunken size that would pin the popup too close to the trigger.
    // Fall back to the rect where offset* is unavailable (jsdom reads 0).
    const rawRect = popup.getBoundingClientRect();
    const popupRect = {
      x: rawRect.x,
      y: rawRect.y,
      width: popup.offsetWidth || rawRect.width,
      height: popup.offsetHeight || rawRect.height,
    };
    const result = computePosition({
      triggerRect,
      popupRect,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      placement,
      offset,
      autoAdjust,
      padding,
      arrowPointAtCenter,
      over,
      ...(arrowEdgeDistance !== undefined ? { arrowEdgeDistance } : {}),
    });
    let x = result.x;
    let y = result.y;
    if (useAbsolute) {
      // computePosition yields viewport coords; convert to the container's
      // local space: subtract the container's box origin and add its scroll.
      const cRect = container.getBoundingClientRect();
      x = x - cRect.left + container.scrollLeft;
      y = y - cRect.top + container.scrollTop;
    }
    popup.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    snapshotSizes();
    onPlacement?.({ placement: result.placement, arrowOffset: result.arrowOffset });
  }

  // Last trigger rect seen by the chase loop, to detect when native momentum/
  // kinetic scrolling (trackpad fling, smooth-scroll) has actually settled.
  let lastChaseX = 0;
  let lastChaseY = 0;
  let stableFrames = 0;

  // 'scroll' events are not guaranteed to fire once per visual frame: the
  // browser may coalesce/throttle them (most visibly during trackpad momentum
  // scrolling), dispatching only one or two events for a fling that spans many
  // frames. A single schedule()-then-stop reposition can therefore snapshot the
  // trigger mid-fling and then never correct itself once the fling settles,
  // leaving the popup stuck away from the trigger. Chase: keep repositioning on
  // every rAF until the trigger's rect stops moving for two consecutive frames,
  // not just once after the triggering event.
  function chase() {
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      position();
      const r = trigger.getBoundingClientRect();
      if (r.x === lastChaseX && r.y === lastChaseY) {
        stableFrames++;
      } else {
        stableFrames = 0;
        lastChaseX = r.x;
        lastChaseY = r.y;
      }
      if (stableFrames < 2) chase();
    });
  }

  function schedule() {
    stableFrames = 0;
    if (frame) return;
    chase();
  }

  // initial position before paint, then keep aligned on scroll/resize.
  position();
  // listen in capture phase so scrolls in any ancestor scroll container reposition.
  window.addEventListener('scroll', schedule, true);
  window.addEventListener('resize', schedule);

  // Size-aware repositioning (parity with Semi's tooltip ResizeObserver):
  // window resize only catches viewport changes, not the trigger or popup
  // resizing in place (async-loaded content growing taller, trigger text
  // expanding, etc). Observe both elements and reposition on any size change.
  // Reuse the existing rAF-throttled schedule(). Degrade silently when the
  // native RO is unavailable — the window listeners above still work.
  let ro: ResizeObserver | undefined;
  if (typeof ResizeObserver === 'function') {
    // RO fires an initial frame on observe(). We must NOT blanket-swallow it: a
    // Tooltip's text often wraps to two lines in its original slot (offsetHeight
    // ~56) and relaxes to one line once max-width/inline-size settles after the
    // portal into <body> (offsetHeight 36). The first position() pinned the popup
    // top using that pre-reflow height, so its bottom edge ends up too far from
    // the trigger (gap 16 instead of 8) unless we re-position after the reflow.
    // Re-position whenever the popup's layout size differs from what the last
    // position() actually used; swallow only the truly-redundant frame (size
    // unchanged) to avoid a wasted rAF.
    ro = new ResizeObserver(() => {
      if (!sizesChanged()) return;
      schedule();
    });
    ro.observe(trigger);
    ro.observe(popup);
  }

  return {
    update: position,
    destroy() {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      ro?.disconnect();
      ro = undefined;
      if (forwardClickToTrigger) {
        popup.removeEventListener('click', onPopupClick);
      }
      // Svelte may have already run its {#if} unmount against the popup's
      // original slot (a no-op, since the node now lives in <body>), so the
      // action owns teardown: remove the portaled popup outright. On the next
      // open Svelte re-creates a fresh node + action instance.
      popup.remove();
    },
  };
}

export interface FloatingActionParams extends UseFloatingOptions {
  /** the trigger element the popup anchors to */
  trigger: HTMLElement | null | undefined;
  /**
   * Optional liveness flag. When a caller keeps the popup mounted while hidden
   * (e.g. Dropdown destroyOnClose=false caches DOM), toggling this forces a
   * reposition on re-show without rebuilding the portal.
   */
  open?: boolean;
  /**
   * Optional reposition key. Changing this value forces the action's `update`
   * to run, which repositions the popup in place (parity with Semi `rePosKey`).
   * The value itself is unused; only its identity change matters.
   */
  rePosKey?: string | number | undefined;
}

/**
 * Svelte action wrapper around useFloating. Use on the popup element:
 *   <div use:floating={{ trigger: rootEl, placement, autoAdjust, onPlacement }}>
 *
 * The action's destroy runs when Svelte tears the node down (before removal),
 * which avoids the `$effect`-cleanup vs `{#if}`-unmount ordering race that would
 * otherwise leave a portaled node orphaned in the DOM.
 */
export function floating(node: HTMLElement, params: FloatingActionParams) {
  let handle: FloatingHandle | undefined;
  let lastTrigger = params.trigger;
  let lastPlacement = params.placement;
  let lastPointAtCenter = params.arrowPointAtCenter;
  let lastOpen = params.open;
  let reopenFrame = 0;

  function start(p: FloatingActionParams) {
    if (!p.trigger) return;
    handle = useFloating(p.trigger, node, p);
  }
  function stop() {
    if (reopenFrame) {
      window.cancelAnimationFrame(reopenFrame);
      reopenFrame = 0;
    }
    handle?.destroy();
    handle = undefined;
  }

  start(params);

  return {
    update(next: FloatingActionParams) {
      // only rebuild (re-portal + re-listen) when the anchor or requested
      // placement changes; otherwise just reposition in place. This avoids a
      // rebuild loop when onPlacement writes back the resolved placement.
      if (
        next.trigger !== lastTrigger ||
        next.placement !== lastPlacement ||
        next.arrowPointAtCenter !== lastPointAtCenter
      ) {
        lastTrigger = next.trigger;
        lastPlacement = next.placement;
        lastPointAtCenter = next.arrowPointAtCenter;
        lastOpen = next.open;
        stop();
        start(next);
        return;
      }
      // 浮层此前可能 display:none（destroyOnClose=false 保持挂载，--hidden 隐藏），
      // 初始定位在隐藏态算得的 popupRect 全 0 → 停在 (0,0)。open 变 true 后浮层可见，
      // 需补建（初始 trigger 曾为 null）或原位重算定位。
      if (!handle && next.trigger) {
        start(next);
      } else {
        // open 从 false→true（重新展开）：此刻调用方多半刚把 hidden 属性摘掉，
        // 但 update() 与该 DOM 变更同批次触发，getComputedStyle(popup).display
        // 可能还没反映出来——position() 内部据此判断"隐藏跳过"会误判，导致浮层
        // 沿用关闭前的旧 transform（触发器早已随页面滚动到别处，浮层却停在原地，
        // 页面未滚动时更是直接对不上）。延后一帧到下一次浏览器渲染后再定位，
        // 此时 hidden 移除已生效、display 不再是 none。
        const reopened = next.open && !lastOpen;
        lastOpen = next.open;
        if (reopened) {
          if (reopenFrame) window.cancelAnimationFrame(reopenFrame);
          reopenFrame = window.requestAnimationFrame(() => {
            reopenFrame = 0;
            handle?.update();
          });
        } else {
          handle?.update();
        }
      }
    },
    destroy: stop,
  };
}
