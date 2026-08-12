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

/**
 * The row box of one item along the main axis, relative to the container's
 * main-axis origin. For axis 'y' these are the CSS top/height; for axis 'x'
 * they carry left/width (the field names stay top/height for back-compat).
 *
 * `left`/`width` are OPTIONAL cross-axis fields, populated only when `wrap:
 * true` (flex-wrap multi-row layouts — e.g. TagInput's variable-width tags).
 * Single-axis callers (Table rows, Tabs bar) never set them and the original
 * 1D geometry (`computeTargetIndex` / `computeItemTransforms`) is untouched.
 */
export interface SortableRect {
  top: number;
  height: number;
  /** Cross-axis start (px, relative to container). Wrap mode only. */
  left?: number;
  /** Cross-axis size (px). Wrap mode only. */
  width?: number;
}

/**
 * A per-item transform result for one drag frame. `translateX` is populated
 * in wrap mode for every item (flex-wrap multi-row layouts need both axes),
 * AND in single-axis mode for the active (dragged) item only — the cross-axis
 * pointer offset, meant for a drag-overlay visual that must follow the pointer
 * on both axes even though the OTHER rows only shift along the main axis to
 * open a gap. Non-active rows in single-axis mode never carry `translateX`.
 */
export interface SortableTransform {
  index: number;
  translateY: number;
  translateX?: number;
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

/**
 * Wrap-mode target index: for flex-wrap multi-row layouts (variable-width
 * items, e.g. TagInput tags) a single-axis midline scan can't tell rows apart
 * — item widths differ, so "pointer past this row's midline" is ambiguous
 * across rows. Instead find the rect whose CENTER is closest to the pointer
 * (Euclidean distance), mirroring dnd-kit's `closestCenter` collision
 * strategy (used by Semi's `_sortable` — the component TagInput's dnd-kit
 * drag is ported from). Clamped to `[0, rects.length - 1]`.
 */
export function computeTargetIndexWrap(
  pointerX: number,
  pointerY: number,
  rects: readonly SortableRect[],
): number {
  const n = rects.length;
  if (n === 0) return 0;
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < n; i++) {
    const r = rects[i]!;
    const cx = (r.left ?? 0) + (r.width ?? 0) / 2;
    const cy = r.top + r.height / 2;
    const dx = pointerX - cx;
    const dy = pointerY - cy;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

/**
 * Wrap-mode transforms: items have different widths and may sit on different
 * rows, so a single uniform `activeHeight` shift (the 1D `computeItemTransforms`
 * assumption) reads wrong at row boundaries. Instead each shifted item moves to
 * the EXACT slot vacated by its neighbor — item at index i takes on rect[i-1]'s
 * (or rect[i+1]'s) box, so the translate is `neighborRect - ownRect` in both
 * axes. This is still a pure permutation-of-transforms (no DOM reorder): each
 * item slides to where the reordered array would visually place it, then a
 * single `onReorder` commits the index change on drop.
 */
export function computeItemTransformsWrap(
  activeIndex: number,
  targetIndex: number,
  pointerDeltaX: number,
  pointerDeltaY: number,
  rects: readonly SortableRect[],
): Array<{ x: number; y: number }> {
  const n = rects.length;
  const result = Array.from({ length: n }, () => ({ x: 0, y: 0 }));
  if (n === 0 || activeIndex < 0 || activeIndex >= n) return result;

  result[activeIndex] = { x: pointerDeltaX, y: pointerDeltaY };

  const own = (i: number): SortableRect => rects[i]!;
  if (targetIndex > activeIndex) {
    // Dragged item moves forward → each item in (active, target] takes on the
    // box of the item just before it (i.e. slides back to fill the gap left
    // behind as the dragged item passes it).
    for (let i = activeIndex + 1; i <= targetIndex && i < n; i++) {
      const from = own(i);
      const to = own(i - 1);
      result[i] = { x: (to.left ?? 0) - (from.left ?? 0), y: to.top - from.top };
    }
  } else if (targetIndex < activeIndex) {
    // Dragged item moves backward → each item in [target, active) takes on
    // the box of the item just after it.
    for (let i = targetIndex; i < activeIndex && i >= 0; i++) {
      const from = own(i);
      const to = own(i + 1);
      result[i] = { x: (to.left ?? 0) - (from.left ?? 0), y: to.top - from.top };
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

  /**
   * Drag axis. `'y'` (default) — vertical list (table rows, vertical tab bar);
   * geometry reads clientY / rect.top / rect.height. `'x'` — horizontal list
   * (horizontal tab bar); geometry reads clientX / rect.left / rect.width and
   * transforms become translateX. Item order/index semantics are identical.
   * Ignored when `wrap: true` (wrap mode is inherently 2D).
   */
  axis?: 'x' | 'y';

  /**
   * Flex-wrap multi-row layout (variable-width items that wrap onto several
   * rows — e.g. TagInput tags). Switches geometry to the 2D `*Wrap` variants:
   * target index is nearest-rect-center (not a single-axis midline scan), and
   * transforms move each shifted item to its exact new (x,y) slot rather than
   * a uniform single-axis shift. `axis` is ignored when this is true.
   */
  wrap?: boolean;

  /**
   * Apply the frame's transforms. Called on every move once dragging.
   * `targetIndex` is the slot the dragged item would land on if dropped now
   * (same value `onReorder`'s `to` will receive) — callers can use it to
   * render a drop-target indicator (e.g. Semi TagInput's `isOver` insert line).
   */
  applyTransforms: (
    transforms: SortableTransform[],
    activeIndex: number,
    targetIndex: number,
  ) => void;
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
  const wrap = options.wrap ?? false;
  const axis = options.axis ?? 'y';
  // Read the main-axis coordinate from a pointer event (clientX for 'x', clientY for 'y').
  const pointerMain = (e: PointerEvent): number => (axis === 'x' ? e.clientX : e.clientY);

  let container: HTMLElement | null = null;
  let initialized = false;

  // Per-drag state.
  let dragging = false;
  let pending = false; // pointerdown seen, awaiting activation distance
  let activeIndex = -1;
  let targetIndex = -1;
  let startPos = 0; // main-axis coordinate at pointerdown (1D mode) / clientX (wrap mode)
  // Raw clientX/clientY at pointerdown, ALWAYS both set regardless of axis/wrap — dnd-kit's
  // DragOverlay follows the pointer with a plain 2D delta (clientX - startPosX, clientY -
  // startPosY) from the activator event, independent of the sort axis/strategy. Do not reuse
  // `startPos`/`startPosY` for this (those hold axis-remapped / wrap-only values).
  let startPosX = 0;
  let startPosY = 0;
  let containerStart = 0; // container's main-axis origin (left for 'x', top for 'y')
  let containerStartY = 0; // container's top — wrap mode only
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
    const cRect = c?.getBoundingClientRect();
    containerStart = cRect ? (axis === 'x' ? cRect.left : cRect.top) : 0;
    containerStartY = cRect ? cRect.top : 0;
    const containerStartX = cRect ? cRect.left : 0;
    const count = options.getItemCount();
    rects = [];
    for (let i = 0; i < count; i++) {
      const el = options.getItemElement(i);
      if (el) {
        const r = el.getBoundingClientRect();
        if (wrap) {
          // Wrap mode always needs both axes, regardless of `axis`.
          rects.push({
            top: r.top - containerStartY,
            height: r.height,
            left: r.left - containerStartX,
            width: r.width,
          });
        } else {
          // `top`/`height` carry main-axis start/size regardless of axis.
          const start = (axis === 'x' ? r.left : r.top) - containerStart;
          const size = axis === 'x' ? r.width : r.height;
          rects.push({ top: start, height: size });
        }
      } else {
        rects.push({ top: 0, height: 0, ...(wrap ? { left: 0, width: 0 } : {}) });
      }
    }
  };

  // 对齐 dnd-kit AbstractPointerSensor：不靠 CSS user-select:none 事前拦截（自定义渲染场景
  // 下用户内容不一定带这条样式），而是拖拽激活瞬间清空一次已产生的选区，并在整个拖拽期间监听
  // document selectionchange、每次变化都立即清空——真机实测 Semi 官方自定义渲染 demo 证实：
  // 即使 computed user-select 是 auto，拖拽全程也不会出现可见的文字选中，正是靠这套「事后清除」
  // 而非「事前阻止」的机制（dnd-kit removeTextSelection）。
  function removeTextSelection(): void {
    doc?.getSelection()?.removeAllRanges();
  }

  const beginDrag = (): void => {
    pending = false;
    dragging = true;
    snapshotRects();
    targetIndex = activeIndex;
    removeTextSelection();
    doc?.addEventListener('selectionchange', removeTextSelection);
    options.onDragStart?.(activeIndex);
  };

  const frame = (clientX: number, clientY: number): void => {
    if (wrap) {
      const deltaX = clientX - startPos;
      const deltaY = clientY - startPosY;
      const activeRect = rects[activeIndex];
      const pointerX = (activeRect ? (activeRect.left ?? 0) + (activeRect.width ?? 0) / 2 : 0) + deltaX;
      const pointerY = (activeRect ? activeRect.top + activeRect.height / 2 : 0) + deltaY;
      targetIndex = computeTargetIndexWrap(pointerX, pointerY, rects);
      const offsets = computeItemTransformsWrap(activeIndex, targetIndex, deltaX, deltaY, rects);
      const transforms: SortableTransform[] = offsets.map(({ x, y }, index) => ({
        index,
        translateY: y,
        translateX: x,
      }));
      options.applyTransforms(transforms, activeIndex, targetIndex);
      return;
    }
    const mainPos = axis === 'x' ? clientX : clientY;
    const pointerDelta = mainPos - startPos;
    // Dragged row's visual center = its original center + delta.
    const activeRect = rects[activeIndex];
    const activeCenter =
      (activeRect ? activeRect.top + activeRect.height / 2 : 0) + pointerDelta;
    targetIndex = computeTargetIndex(activeCenter, rects, activeIndex);
    const offsets = computeItemTransforms(
      activeIndex,
      targetIndex,
      pointerDelta,
      rects,
    );
    // Cross-axis pointer travel — meaningful ONLY for the active row's drag
    // overlay (dnd-kit's DragOverlay follows the pointer with a plain 2D delta
    // from the activator event, independent of sort axis/strategy — the OTHER
    // rows' shift-to-open-a-gap transform stays main-axis-only, untouched).
    // Other rows never receive this field, matching the axis:'x'/'y' contract.
    const transforms: SortableTransform[] = offsets.map((translateY, index) => ({
      index,
      translateY,
      ...(index === activeIndex ? { translateX: clientX - startPosX } : {}),
    }));
    options.applyTransforms(transforms, activeIndex, targetIndex);
  };

  const detachDocument = (): void => {
    doc?.removeEventListener('pointermove', onPointerMove);
    doc?.removeEventListener('pointerup', onPointerUp);
    doc?.removeEventListener('pointercancel', onPointerCancel);
    doc?.removeEventListener('keydown', onKeyDown);
    doc?.removeEventListener('selectionchange', removeTextSelection);
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
      // Wrap mode: either axis moving past the threshold activates (tags can
      // shift within a row (x) or across rows (y)). Single-axis mode only
      // watches the main axis, as before.
      const past = wrap
        ? Math.hypot(e.clientX - startPos, e.clientY - startPosY) >= activationDistance
        : Math.abs(pointerMain(e) - startPos) >= activationDistance;
      if (!past) return;
      beginDrag();
    }
    if (!dragging) return;
    // Prevent text selection / native scroll interference during drag.
    e.preventDefault();
    frame(e.clientX, e.clientY);
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
    startPos = wrap ? e.clientX : pointerMain(e);
    startPosX = e.clientX;
    startPosY = e.clientY;
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
