/**
 * sortable — Svelte action wrapping core's createSortable for vertical row
 * drag-sorting (dnd-kit approach). Attach it to a container element that holds
 * a list/table body; during a drag it writes CSS `transform`/`transition` onto
 * the rows (never touching DOM structure), and calls `onReorder(from, to)` once
 * on drop so the host can run `arrayMove` on its data.
 *
 * DOM landing lives here (framework-specific); the geometry + lifecycle live in
 * core (framework-agnostic), mirroring the drag-move split.
 */
import type { Action } from 'svelte/action';
import {
  createSortable,
  type SortableController,
  type SortableTransform,
} from '@chenzy-design/core';

export interface SortableActionParams {
  /** Current item count (must equal the number of sortable rows rendered). */
  getItemCount: () => number;
  /** The ONLY data-mutation hook: fired on drop when the order changed. */
  onReorder: (from: number, to: number) => void;
  /**
   * Resolve the dragged item index from a pointerdown. Defaults to locating the
   * closest `[data-sortable-item]` (or `<tr>`) row within the container and
   * returning its position among sibling rows. Return `-1` to ignore.
   */
  resolveIndexFromEvent?: (e: PointerEvent, container: HTMLElement) => number;
  /**
   * Select the row elements this action transforms/measures, in data order.
   * Defaults to `[data-sortable-item]` rows, falling back to the rows of the
   * container's `<tbody>` (Table case), else the container's direct children.
   */
  getRows?: (container: HTMLElement) => HTMLElement[];
  /** Min pointer travel (px) before a drag starts. Default 1. */
  activationDistance?: number;
  /**
   * Drag axis. `'y'` (default) — vertical list (table rows, vertical tab bar).
   * `'x'` — horizontal list (horizontal tab bar); transforms become translateX.
   * Ignored when `wrap: true`.
   */
  axis?: 'x' | 'y';
  /**
   * Flex-wrap multi-row layout (variable-width items that wrap onto several
   * rows — e.g. TagInput tags). Switches to 2D geometry: target index is
   * nearest-rect-center, and each shifted item transforms to its exact new
   * (x,y) slot instead of a uniform single-axis shift. `axis` is ignored.
   */
  wrap?: boolean;
  /**
   * CSS transition applied to shifting items during the drag — directly
   * mirrors Semi `_sortable`'s `<Sortable transition={...} />` prop (passed
   * straight through to dnd-kit's `useSortable({ transition })`). In Semi,
   * `SortableItem`'s `wrapperStyle` is computed as
   * `!isNull(transition) ? { transform, transition } : undefined` — i.e. the
   * transition value is the SAME switch that gates whether items transform at
   * all, not a separate concern. This mirrors that exactly:
   * - a string (default `'transform 200ms ease'`) → items transform/animate
   *   into their new slots as the pointer moves (dnd-kit's live-shift default,
   *   used by Table's drag-sort demo).
   * - `null` → no item receives a transform during the drag (confirmed against
   *   the live Semi TagInput page: other items' rects are pixel-identical
   *   before/after pointer moves) — TagInput passes this explicitly
   *   (`tagInput/index.tsx` `<Sortable transition={null} .../>`), pairing it
   *   with `dragOverlay: true` so the only moving visual is the overlay + the
   *   `onDragOver` drop-target indicator; the list re-renders in its new order
   *   only once `onReorder` fires on drop.
   */
  transition?: string | null;
  /**
   * dnd-kit-style drag overlay (对齐 Semi `_sortable` `useDragOverlay: true` 默认态，
   * 本库 TagInput 拖拽移植自此): when true, the dragged item's original element stays
   * in place (dimmed via host CSS class, e.g. `.cd-tag-input-sortable-item-active`)
   * and does NOT receive a translate transform — its position/size are reported via
   * `onDragOverlayStart`/`onDragOverlayMove`/`onDragOverlayEnd` instead, so the HOST
   * renders the pointer-following visual (a real Svelte component instance, e.g. by
   * re-invoking the same snippet used for the list item — NOT a DOM clone, which
   * would detach from the component's reactive/effect state, e.g. Paragraph's
   * ResizeObserver-based ellipsis measurement, and render garbled). Default false
   * (existing callers unaffected — they never call the overlay callbacks).
   */
  dragOverlay?: boolean;
  /**
   * Fires once when a drag-overlay drag starts, with the dragged item's initial
   * viewport rect (from `getBoundingClientRect()`) and its index. Only called when
   * `dragOverlay: true`.
   */
  onDragOverlayStart?: (index: number, rect: DOMRect) => void;
  /**
   * Fires every frame during a drag-overlay drag with the overlay's current
   * top/left (viewport px, `position:fixed` coordinates — origin rect + this
   * frame's translate). Only called when `dragOverlay: true`.
   */
  onDragOverlayMove?: (top: number, left: number) => void;
  /** Fires once when a drag-overlay drag ends (drop or cancel). */
  onDragOverlayEnd?: () => void;
  onDragStart?: (index: number) => void;
  onDragEnd?: (from: number, to: number) => void;
  onDragCancel?: () => void;
  /**
   * Called on every drag frame with the slot the dragged item would land on
   * if dropped now. Lets the host render a drop-target indicator (e.g. Semi
   * TagInput's `isOver` insert line). Optional — most callers don't need it.
   */
  onDragOver?: (targetIndex: number) => void;
}

const defaultGetRows = (container: HTMLElement): HTMLElement[] => {
  const tagged = container.querySelectorAll<HTMLElement>('[data-sortable-item]');
  if (tagged.length) return [...tagged];
  const tbody = container.querySelector('tbody');
  if (tbody) return [...tbody.rows] as HTMLElement[];
  return [...container.children] as HTMLElement[];
};

const defaultResolveIndex = (
  e: PointerEvent,
  container: HTMLElement,
): number => {
  const target = e.target as HTMLElement | null;
  if (!target) return -1;
  const rows = defaultGetRows(container);
  const row = target.closest<HTMLElement>('[data-sortable-item], tr');
  if (!row) return -1;
  return rows.indexOf(row);
};

export const sortable: Action<HTMLElement, SortableActionParams> = (
  node,
  params,
) => {
  let current = params;
  let ctrl: SortableController | null = null;

  const rows = (): HTMLElement[] =>
    (current.getRows ?? defaultGetRows)(node);

  // --- drag overlay state (only used when dragOverlay: true) ---
  // Origin is the dragged item's viewport rect at drag start; each frame's
  // top/left is origin + this frame's translate. No DOM is created/owned here —
  // the host renders its own overlay node from these coordinates.
  let overlayOriginX = 0;
  let overlayOriginY = 0;

  const applyTransforms = (
    transforms: SortableTransform[],
    activeIndex: number,
    targetIndex: number,
  ): void => {
    const els = rows();
    const isWrap = current.wrap ?? false;
    const isX = (current.axis ?? 'y') === 'x';
    const useOverlay = current.dragOverlay ?? false;
    // Mirrors Semi SortableItem: `wrapperStyle = !isNull(transition) ? {...} : undefined`.
    // `transition === null` means no item gets a transform this frame, full stop —
    // not "everyone except the dragged item"; the dragged item's visual motion
    // comes entirely from the (separately-wired) drag overlay when that's on.
    const transitionCss = current.transition;
    const wrapperStyleApplies = transitionCss !== null;
    for (const { index, translateY, translateX } of transforms) {
      if (useOverlay && index === activeIndex) {
        // Dragged item's home element stays put (dimmed via host CSS class);
        // report the pointer-following coordinates for the host's own overlay.
        // The overlay always follows the pointer on BOTH axes (dnd-kit DragOverlay
        // behavior) — even in single-axis mode where the OTHER rows only shift
        // along the main axis. core now reports the active item's cross-axis
        // pointer offset via translateX in single-axis mode too (see core
        // frame()'s per-frame transforms), so this no longer collapses to 0.
        const x = isWrap ? (translateX ?? 0) : isX ? translateY : (translateX ?? 0);
        const y = isWrap ? translateY : isX ? (translateX ?? 0) : translateY;
        current.onDragOverlayMove?.(overlayOriginY + y, overlayOriginX + x);
        continue;
      }
      if (!wrapperStyleApplies) continue;
      const el = els[index];
      if (!el) continue;
      const x = isWrap ? (translateX ?? 0) : isX ? translateY : 0;
      const y = isWrap ? translateY : isX ? 0 : translateY;
      el.style.transform = x || y ? `translate(${x}px, ${y}px)` : '';
      // The dragged row must follow the pointer with no lag → no transition.
      el.style.transition = index === activeIndex ? 'none' : (transitionCss ?? 'transform 200ms ease');
      if (index === activeIndex && (x || y)) {
        el.style.zIndex = '1';
        el.style.position = 'relative';
      }
    }
    current.onDragOver?.(targetIndex);
  };

  const clearTransforms = (): void => {
    for (const el of rows()) {
      el.style.transform = '';
      el.style.transition = '';
      el.style.zIndex = '';
      el.style.position = '';
    }
    if (current.dragOverlay) current.onDragOverlayEnd?.();
    current.onDragOver?.(-1);
  };

  const build = (): void => {
    ctrl?.destroy();
    ctrl = createSortable({
      getContainer: () => node as HTMLElement,
      getItemElement: (i) => rows()[i] ?? null,
      getItemCount: () => current.getItemCount(),
      resolveIndexFromEvent: (e) =>
        (current.resolveIndexFromEvent ?? defaultResolveIndex)(e, node),
      ...(current.activationDistance !== undefined
        ? { activationDistance: current.activationDistance }
        : {}),
      ...(current.axis !== undefined ? { axis: current.axis } : {}),
      ...(current.wrap !== undefined ? { wrap: current.wrap } : {}),
      applyTransforms,
      clearTransforms,
      onReorder: (from, to) => current.onReorder(from, to),
      onDragStart: (i) => {
        if (current.dragOverlay) {
          const source = rows()[i];
          const rect = source?.getBoundingClientRect();
          if (rect) {
            overlayOriginX = rect.left;
            overlayOriginY = rect.top;
            current.onDragOverlayStart?.(i, rect);
          }
        }
        current.onDragStart?.(i);
      },
      onDragEnd: (from, to) => current.onDragEnd?.(from, to),
      onDragCancel: () => current.onDragCancel?.(),
    });
    ctrl.init();
  };

  build();

  return {
    update(next: SortableActionParams) {
      current = next;
      // Callbacks are read live via `current`; no rebuild needed unless the
      // container identity changes (it never does for a mounted action).
    },
    destroy() {
      // If unmounted mid-drag, tell the host to tear down its overlay node too.
      if (ctrl?.isDragging() && current.dragOverlay) current.onDragOverlayEnd?.();
      ctrl?.destroy();
      ctrl = null;
    },
  };
};
