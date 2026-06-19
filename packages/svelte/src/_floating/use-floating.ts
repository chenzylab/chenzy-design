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
  /** called after each reposition with the resolved side/align + arrow offset */
  onPlacement?: (info: { placement: Placement; arrowOffset: number }) => void;
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

  const { placement, offset = 8, autoAdjust = true, padding = 4, onPlacement } = options;

  // portal: detach the popup from its in-flow parent and append to body so it
  // escapes any `overflow:hidden` ancestor clipping.
  const originalParent = popup.parentNode;
  const originalNext = popup.nextSibling;
  document.body.appendChild(popup);
  popup.style.position = 'fixed';
  popup.style.insetBlockStart = '0';
  popup.style.insetInlineStart = '0';
  popup.style.margin = '0';

  let frame = 0;

  function position() {
    const triggerRect = trigger.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const result = computePosition({
      triggerRect,
      popupRect,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      placement,
      offset,
      autoAdjust,
      padding,
    });
    popup.style.transform = `translate(${Math.round(result.x)}px, ${Math.round(result.y)}px)`;
    onPlacement?.({ placement: result.placement, arrowOffset: result.arrowOffset });
  }

  function schedule() {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      position();
    });
  }

  // initial position before paint, then keep aligned on scroll/resize.
  position();
  // listen in capture phase so scrolls in any ancestor scroll container reposition.
  window.addEventListener('scroll', schedule, true);
  window.addEventListener('resize', schedule);

  return {
    update: position,
    destroy() {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      // restore the popup to its original DOM slot so Svelte can unmount it.
      if (originalParent) {
        originalParent.insertBefore(popup, originalNext);
      } else {
        popup.remove();
      }
    },
  };
}
