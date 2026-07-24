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
   */
  axis?: 'x' | 'y';
  /** Transition applied to the shifting (non-dragged) rows. Default 'transform 200ms ease'. */
  transition?: string;
  onDragStart?: (index: number) => void;
  onDragEnd?: (from: number, to: number) => void;
  onDragCancel?: () => void;
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
  const transition = () => current.transition ?? 'transform 200ms ease';

  const rows = (): HTMLElement[] =>
    (current.getRows ?? defaultGetRows)(node);

  const applyTransforms = (
    transforms: SortableTransform[],
    activeIndex: number,
  ): void => {
    const els = rows();
    const isX = (current.axis ?? 'y') === 'x';
    // `translateY` field carries the main-axis translate regardless of axis.
    for (const { index, translateY: mainTranslate } of transforms) {
      const el = els[index];
      if (!el) continue;
      el.style.transform = mainTranslate
        ? isX
          ? `translateX(${mainTranslate}px)`
          : `translateY(${mainTranslate}px)`
        : '';
      // The dragged row must follow the pointer with no lag → no transition.
      el.style.transition = index === activeIndex ? 'none' : transition();
      if (index === activeIndex && mainTranslate) {
        el.style.zIndex = '1';
        el.style.position = 'relative';
      }
    }
  };

  const clearTransforms = (): void => {
    for (const el of rows()) {
      el.style.transform = '';
      el.style.transition = '';
      el.style.zIndex = '';
      el.style.position = '';
    }
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
      applyTransforms,
      clearTransforms,
      onReorder: (from, to) => current.onReorder(from, to),
      onDragStart: (i) => current.onDragStart?.(i),
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
      ctrl?.destroy();
      ctrl = null;
    },
  };
};
