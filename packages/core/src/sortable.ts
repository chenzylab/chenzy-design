/**
 * sortable — framework-agnostic vertical list drag-sort geometry primitive,
 * ported from the dnd-kit approach (see semi-ui table DndKitDrag story). Third
 * shared drag primitive lowered to core (after createResizeDrag / createDragMove).
 *
 * Unlike svelte-dnd-action (which mutates the container's DOM children during a
 * drag and thus fights a wrapping component's own keyed render → dropped rows),
 * this primitive NEVER touches DOM structure. During a drag it only reports each
 * item's `translateY` offset; the caller applies it as a CSS transform, so the
 * host framework keeps full control of the DOM. Data changes exactly once, on
 * drop, via `onReorder(from, to)` → the caller runs `arrayMove` (length-preserving).
 *
 * Geometry (`arrayMove` / `computeTargetIndex` / `computeItemTransforms`) is pure
 * and unit-testable. `createSortable` owns the lifecycle: pointerdown on the
 * container is delegated; document move/up/keydown listeners are bound
 * imperatively on drag start and released on end/cancel/destroy (redline: no
 * reactive attachments). Pointer Events unify mouse + touch.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The row box of one item, relative to the sortable container's top. */
export interface SortableRect {
  top: number;
  height: number;
}

/** A per-item transform result for one drag frame. */
export interface SortableTransform {
  index: number;
  translateY: number;
}

// ---------------------------------------------------------------------------
// Geometry (pure — no DOM writes)
// ---------------------------------------------------------------------------

/**
 * Move the element at `from` to `to`, returning a NEW array. Length- and
 * element-preserving: the result is always a permutation of the input with the
 * same length (this is the direct guard against the dropped-row bug). Out-of-range
 * or equal indices return a shallow copy unchanged.
 */
export function arrayMove<T>(list: readonly T[], from: number, to: number): T[] {
  const next = list.slice();
  const len = next.length;
  if (from < 0 || from >= len || to < 0 || to >= len || from === to) {
    return next;
  }
  const moved = next.splice(from, 1)[0] as T;
  next.splice(to, 0, moved);
  return next;
}

/**
 * Given the dragged row's current visual center (`pointerCenterY`, relative to
 * the container top) and the start-of-drag row boxes, return the index the
 * dragged row should insert at. Mirrors dnd-kit's verticalListSortingStrategy:
 * the first row whose midline the pointer center is above wins. Clamped to
 * `[0, rects.length - 1]`.
 */
export function computeTargetIndex(
  pointerCenterY: number,
  rects: readonly SortableRect[],
  _activeIndex: number,
): number {
  const n = rects.length;
  if (n === 0) return 0;
  for (let i = 0; i < n; i++) {
    const r = rects[i]!;
    const midline = r.top + r.height / 2;
    if (pointerCenterY < midline) return i;
  }
  return n - 1;
}

/**
 * Compute each item's `translateY` (px) for the current drag frame. The dragged
 * row follows the pointer (`pointerDeltaY`); rows between the active and target
 * positions shift by one active-row height to open the gap. All other rows stay
 * at 0. DOM order never changes — only these transforms do.
 *
 * Rows are assumed uniform-height enough that a single `activeHeight` gap reads
 * correctly (the common table case); the shift uses `rects[activeIndex].height`.
 */
export function computeItemTransforms(
  activeIndex: number,
  targetIndex: number,
  pointerDeltaY: number,
  rects: readonly SortableRect[],
): number[] {
  const n = rects.length;
  const result = new Array<number>(n).fill(0);
  if (n === 0 || activeIndex < 0 || activeIndex >= n) return result;

  // Dragged row: pure follow-the-pointer.
  result[activeIndex] = pointerDeltaY;

  const activeHeight = rects[activeIndex]!.height;
  if (targetIndex > activeIndex) {
    // Dragged row moves down → rows (activeIndex, targetIndex] shift up.
    for (let i = activeIndex + 1; i <= targetIndex && i < n; i++) {
      result[i] = -activeHeight;
    }
  } else if (targetIndex < activeIndex) {
    // Dragged row moves up → rows [targetIndex, activeIndex) shift down.
    for (let i = targetIndex; i < activeIndex && i >= 0; i++) {
      result[i] = activeHeight;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// createSortable — vertical drag-sort lifecycle primitive
// ---------------------------------------------------------------------------

export interface CreateSortableOptions {
  /** The container to delegate pointerdown on (e.g. the tbody or a wrapper). */
  getContainer: () => HTMLElement | null;
  /** Resolve the row element for a given item index (to snapshot rects + write transforms). */
  getItemElement: (index: number) => HTMLElement | null;
  /** Current item count; read once at drag start. */
  getItemCount: () => number;
  /**
   * Resolve the dragged item index from the originating pointerdown. Return `-1`
   * to ignore (e.g. pointer not on a draggable row / handle).
   */
  resolveIndexFromEvent: (e: PointerEvent) => number;

  /** Min pointer travel (px) before a drag actually starts. Default 1 (aligns Semi distance:1). */
  activationDistance?: number;

  /** Apply the frame's transforms. Called on every move once dragging. */
  applyTransforms: (transforms: SortableTransform[], activeIndex: number) => void;
  /** Clear all transforms/transitions. Called on drop/cancel. */
  clearTransforms: () => void;

  /** The ONLY data-mutation hook: fired on drop when the order actually changed. */
  onReorder: (from: number, to: number) => void;

  /** Called once when a drag actually starts (after the activation distance). */
  onDragStart?: (index: number) => void;
  /** Called at drag end (drop), whether or not the order changed. */
  onDragEnd?: (from: number, to: number) => void;
  /** Called when a drag is cancelled (Escape). */
  onDragCancel?: () => void;

  /** Document to bind listeners on (defaults to the global document). */
  ownerDocument?: Document;
}

export interface SortableController {
  /** Bind the delegated pointerdown listener on the container. Idempotent. */
  init(): void;
  /** Whether a drag is currently active. */
  isDragging(): boolean;
  /** Detach container + any live document listeners (unmount safety net). */
  destroy(): void;
}

export function createSortable(
  options: CreateSortableOptions,
): SortableController {
  const doc: Document | undefined =
    options.ownerDocument ??
    (typeof document !== 'undefined' ? document : undefined);
  const activationDistance = options.activationDistance ?? 1;

  let container: HTMLElement | null = null;
  let initialized = false;

  // Per-drag state.
  let dragging = false;
  let pending = false; // pointerdown seen, awaiting activation distance
  let activeIndex = -1;
  let targetIndex = -1;
  let startY = 0;
  let containerTop = 0;
  let rects: SortableRect[] = [];

  const resetDragState = (): void => {
    dragging = false;
    pending = false;
    activeIndex = -1;
    targetIndex = -1;
    rects = [];
  };

  const snapshotRects = (): void => {
    const c = options.getContainer();
    containerTop = c ? c.getBoundingClientRect().top : 0;
    const count = options.getItemCount();
    rects = [];
    for (let i = 0; i < count; i++) {
      const el = options.getItemElement(i);
      if (el) {
        const r = el.getBoundingClientRect();
        rects.push({ top: r.top - containerTop, height: r.height });
      } else {
        rects.push({ top: 0, height: 0 });
      }
    }
  };

  const beginDrag = (): void => {
    pending = false;
    dragging = true;
    snapshotRects();
    targetIndex = activeIndex;
    options.onDragStart?.(activeIndex);
  };

  const frame = (clientY: number): void => {
    const pointerDeltaY = clientY - startY;
    // Dragged row's visual center = its original center + delta.
    const activeRect = rects[activeIndex];
    const activeCenter =
      (activeRect ? activeRect.top + activeRect.height / 2 : 0) + pointerDeltaY;
    targetIndex = computeTargetIndex(activeCenter, rects, activeIndex);
    const offsets = computeItemTransforms(
      activeIndex,
      targetIndex,
      pointerDeltaY,
      rects,
    );
    const transforms: SortableTransform[] = offsets.map((translateY, index) => ({
      index,
      translateY,
    }));
    options.applyTransforms(transforms, activeIndex);
  };

  const detachDocument = (): void => {
    doc?.removeEventListener('pointermove', onPointerMove);
    doc?.removeEventListener('pointerup', onPointerUp);
    doc?.removeEventListener('pointercancel', onPointerCancel);
    doc?.removeEventListener('keydown', onKeyDown);
  };

  const finishDrag = (commit: boolean): void => {
    options.clearTransforms();
    const from = activeIndex;
    const to = targetIndex;
    detachDocument();
    if (dragging) {
      if (commit && from !== to && from >= 0 && to >= 0) {
        options.onReorder(from, to);
      }
      options.onDragEnd?.(from, to);
    }
    resetDragState();
  };

  function onPointerMove(e: PointerEvent): void {
    if (pending) {
      if (Math.abs(e.clientY - startY) < activationDistance) return;
      beginDrag();
    }
    if (!dragging) return;
    // Prevent text selection / native scroll interference during drag.
    e.preventDefault();
    frame(e.clientY);
  }

  function onPointerUp(): void {
    finishDrag(true);
  }

  function onPointerCancel(): void {
    finishDrag(false);
  }

  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && (dragging || pending)) {
      options.clearTransforms();
      detachDocument();
      options.onDragCancel?.();
      resetDragState();
    }
  }

  const onPointerDown = (e: PointerEvent): void => {
    if (dragging || pending) return;
    const idx = options.resolveIndexFromEvent(e);
    if (idx < 0) return;
    activeIndex = idx;
    startY = e.clientY;
    pending = true;
    if (doc) {
      doc.addEventListener('pointermove', onPointerMove);
      doc.addEventListener('pointerup', onPointerUp);
      doc.addEventListener('pointercancel', onPointerCancel);
      doc.addEventListener('keydown', onKeyDown);
    }
  };

  return {
    init(): void {
      if (initialized) return;
      container = options.getContainer();
      if (!container) {
        throw new Error('Sortable: container must be a valid element');
      }
      container.addEventListener('pointerdown', onPointerDown);
      initialized = true;
    },
    isDragging(): boolean {
      return dragging;
    },
    destroy(): void {
      container?.removeEventListener('pointerdown', onPointerDown);
      detachDocument();
      resetDragState();
      initialized = false;
    },
  };
}
