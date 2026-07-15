<!--
  ResizeGroup — horizontal/vertical split of ResizeItem panels separated by
  ResizeHandler. Children register declaratively via context (§9.3: registration
  is bookkept in PLAIN arrays, first-frame measurement is deferred with
  setTimeout 0 and cleaned up, so no effect_update_depth_exceeded).

  Coupling geometry is delegated to core computeGroupResize (Semi-ported):
  dragging a handler grows one neighbour and shrinks the other, conserving the
  sum; per-item min/max clamps redistribute to keep the total. Sizes live as
  `calc(percent% - minus)` flex-basis where minus reserves half a handler.
  DOM mirrors Semi: root cd-resizable-group with inline flex-direction plus an
  isResizing fixed background overlay.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount, setContext, tick } from 'svelte';
  import {
    computeGroupResize,
    getOffset,
    type GroupDirection,
  } from '@chenzy-design/core';
  import {
    RESIZE_GROUP_KEY,
    type ResizeGroupContext,
    type ResizeItemRegistration,
    type ResizeHandlerRegistration,
  } from './context.js';

  interface Props {
    /** 分栏方向（横向=调宽，纵向=调高）。默认 horizontal。 */
    direction?: GroupDirection;
    class?: string;
    style?: string;
    children?: Snippet;
  }

  let { direction = 'horizontal', class: className = '', style, children }: Props = $props();

  let groupEl = $state<HTMLDivElement | null>(null);
  let isResizing = $state(false);

  // 声明式注册用普通数组簿记（非 $state，避免 §9.3 effect 自循环）。
  const items: ResizeItemRegistration[] = [];
  const handlers: ResizeHandlerRegistration[] = [];

  // 每项当前百分比（消浮点） / handler 留位补偿。以 item id 为 key。
  const itemPercent = new Map<number, number>();
  const itemMinus = new Map<number, number>();

  // 拖拽期间的全局监听句柄（命令式，红线 no.3）。
  let activeMove: ((e: PointerEvent) => void) | null = null;
  let activeUp: ((e: PointerEvent) => void) | null = null;

  function groupSize(): number {
    if (!groupEl) return 0;
    return direction === 'horizontal' ? groupEl.offsetWidth : groupEl.offsetHeight;
  }

  // DOM 顺序排序（注册顺序即挂载顺序，但用 DOM 位置更可靠）。
  function orderedItems(): ResizeItemRegistration[] {
    return [...items].sort((a, b) => domIndex(a.getEl()) - domIndex(b.getEl()));
  }
  function orderedHandlers(): ResizeHandlerRegistration[] {
    return [...handlers].sort((a, b) => domIndex(a.getEl()) - domIndex(b.getEl()));
  }
  function domIndex(el: HTMLElement | null): number {
    if (!el || !groupEl) return 0;
    return Array.prototype.indexOf.call(groupEl.children, el);
  }

  // 首帧测量：按 default/min/max 分配百分比，写入 flex-basis。延后一帧纳入 cleanup。
  function initSpace(): void {
    const parent = groupSize();
    if (parent <= 0) return;
    const its = orderedItems();
    const hs = orderedHandlers();
    const handlerSizes = hs.map((h) => {
      const el = h.getEl();
      if (!el) return 0;
      return direction === 'horizontal' ? el.offsetWidth : el.offsetHeight;
    });

    // 每项 minus：相邻 handler 的一半
    its.forEach((it, i) => {
      let minus = 0;
      if (i === 0) minus = (handlerSizes[0] ?? 0) / 2;
      else if (i === its.length - 1) minus = (handlerSizes[i - 1] ?? 0) / 2;
      else minus = (handlerSizes[i - 1] ?? 0) / 2 + (handlerSizes[i] ?? 0) / 2;
      itemMinus.set(it.id, minus);
    });

    let totalPercent = 0;
    const undefLoc = new Map<number, number>();
    let undefTotal = 0;

    its.forEach((it) => {
      const def = it.getDefaultSize();
      if (def != null && def !== '') {
        let pct: number | null = null;
        if (typeof def === 'string') {
          if (def.endsWith('%')) pct = parseFloat(def.slice(0, -1));
          else if (def.endsWith('px')) pct = (parseFloat(def.slice(0, -2)) / parent) * 100;
          else if (/^-?\d+(\.\d+)?$/.test(def)) {
            undefLoc.set(it.id, parseFloat(def));
            undefTotal += parseFloat(def);
            return;
          }
        } else if (typeof def === 'number') {
          undefLoc.set(it.id, def);
          undefTotal += def;
          return;
        }
        if (pct != null) {
          itemPercent.set(it.id, pct);
          totalPercent += pct;
          applyBasis(it, pct);
        }
      } else {
        undefLoc.set(it.id, 1);
        undefTotal += 1;
      }
    });

    let undefPercent = 100 - totalPercent;
    if (totalPercent > 100) undefPercent = 10;
    undefLoc.forEach((weight, id) => {
      const it = its.find((x) => x.id === id);
      if (!it) return;
      const pct = undefTotal > 0 ? (weight / undefTotal) * undefPercent : 0;
      itemPercent.set(id, pct);
      applyBasis(it, pct);
    });
  }

  function applyBasis(it: ResizeItemRegistration, pct: number): void {
    const el = it.getEl();
    if (!el) return;
    const minus = itemMinus.get(it.id) ?? 0;
    const basis = `calc(${pct}% - ${minus}px)`;
    if (direction === 'horizontal') {
      el.style.flex = `0 0 ${basis}`;
      el.style.width = basis;
    } else {
      el.style.flex = `0 0 ${basis}`;
      el.style.height = basis;
    }
  }

  onMount(() => {
    // 首帧测量延后一帧（DOM 完成布局），纳入 cleanup。
    const id = setTimeout(() => {
      initSpace();
    }, 0);
    return () => {
      clearTimeout(id);
      if (activeMove) document.removeEventListener('pointermove', activeMove);
      if (activeUp) document.removeEventListener('pointerup', activeUp);
    };
  });

  function neighboursOf(handlerId: number): {
    last: ResizeItemRegistration;
    next: ResizeItemRegistration;
    idx: number;
  } | null {
    const hs = orderedHandlers();
    const its = orderedItems();
    const idx = hs.findIndex((h) => h.id === handlerId);
    if (idx < 0 || idx + 1 >= its.length) return null;
    const last = its[idx];
    const next = its[idx + 1];
    if (!last || !next) return null;
    return { last, next, idx };
  }

  function startHandlerDrag(handlerId: number, event: PointerEvent): void {
    const pair = neighboursOf(handlerId);
    if (!pair || !groupEl) return;
    const { last, next } = pair;
    const lastEl = last.getEl();
    const nextEl = next.getEl();
    if (!lastEl || !nextEl) return;

    // onResizeStart（返回 false 取消）
    const [lastDir, nextDir] = direction === 'horizontal' ? (['right', 'left'] as const) : (['bottom', 'top'] as const);
    const c1 = last.onResizeStart?.(event, lastDir);
    const c2 = next.onResizeStart?.(event, nextDir);
    if (c1 === false || c2 === false) return;

    event.preventDefault();
    isResizing = true;

    const win = groupEl.ownerDocument.defaultView ?? window;
    const lastMinus = itemMinus.get(last.id) ?? 0;
    const nextMinus = itemMinus.get(next.id) ?? 0;
    const lastOffset = getOffset(win.getComputedStyle(lastEl), direction) + lastMinus;
    const nextOffset = getOffset(win.getComputedStyle(nextEl), direction) + nextMinus;
    const lastItemSize = (direction === 'horizontal' ? lastEl.offsetWidth : lastEl.offsetHeight) + lastMinus;
    const nextItemSize = (direction === 'horizontal' ? nextEl.offsetWidth : nextEl.offsetHeight) + nextMinus;
    const initX = event.clientX;
    const initY = event.clientY;
    const parent = groupSize();

    const onMove = (e: PointerEvent) => {
      const delta = direction === 'horizontal' ? e.clientX - initX : e.clientY - initY;
      const r = computeGroupResize({
        direction,
        parentSize: parent,
        delta,
        lastItemSize,
        nextItemSize,
        lastItemPercent: itemPercent.get(last.id) ?? 0,
        nextItemPercent: itemPercent.get(next.id) ?? 0,
        last: { min: last.getMin(), max: last.getMax(), offset: lastOffset },
        next: { min: next.getMin(), max: next.getMax(), offset: nextOffset },
      });
      itemPercent.set(last.id, r.lastNewPercent);
      itemPercent.set(next.id, r.nextNewPercent);
      applyBasis(last, r.lastNewPercent);
      applyBasis(next, r.nextNewPercent);
      last.onChange?.({ width: lastEl.offsetWidth, height: lastEl.offsetHeight }, e, lastDir);
      next.onChange?.({ width: nextEl.offsetWidth, height: nextEl.offsetHeight }, e, nextDir);
    };
    const onUp = (e: PointerEvent) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      activeMove = null;
      activeUp = null;
      isResizing = false;
      last.onResizeEnd?.({ width: lastEl.offsetWidth, height: lastEl.offsetHeight }, e, lastDir);
      next.onResizeEnd?.({ width: nextEl.offsetWidth, height: nextEl.offsetHeight }, e, nextDir);
    };
    activeMove = onMove;
    activeUp = onUp;
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  let nextId = 0;
  const ctx: ResizeGroupContext = {
    direction: () => direction,
    registerItem(reg) {
      reg.id = nextId++;
      items.push(reg);
      // 新增项后重新测量（延后一帧，避免注册期同步 dispatch 引发 §9.3 循环）。
      queueMeasure();
      return () => {
        const i = items.indexOf(reg);
        if (i >= 0) items.splice(i, 1);
      };
    },
    registerHandler(reg) {
      reg.id = nextId++;
      handlers.push(reg);
      return () => {
        const i = handlers.indexOf(reg);
        if (i >= 0) handlers.splice(i, 1);
      };
    },
    startHandlerDrag,
  };

  let measureQueued = false;
  function queueMeasure(): void {
    if (measureQueued) return;
    measureQueued = true;
    tick().then(() => {
      measureQueued = false;
      // 仅在尚未分配百分比时初始化（避免拖拽后被重置）。
      if (itemPercent.size < items.length) initSpace();
    });
  }

  setContext<ResizeGroupContext>(RESIZE_GROUP_KEY, ctx);

  const cls = $derived(['cd-resizable-group', className].filter(Boolean).join(' '));
  const groupStyle = $derived(
    [`flex-direction:${direction === 'vertical' ? 'column' : 'row'}`, style ?? '']
      .filter(Boolean)
      .join(';'),
  );
</script>

<div bind:this={groupEl} class={cls} style={groupStyle}>
  {#if isResizing}
    <div class="cd-resizable-background"></div>
  {/if}
  {@render children?.()}
</div>

<style>
  .cd-resizable-group {
    display: flex;
    position: relative;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
  }

  .cd-resizable-background {
    height: 100%;
    width: 100%;
    inset: 0;
    z-index: 20;
    opacity: 0;
    position: fixed;
  }
</style>
