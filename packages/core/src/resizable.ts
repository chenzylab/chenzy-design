/**
 * resizable — framework-agnostic drag geometry primitives for the Resizable
 * component family (single container + split group). Also the FIRST shared drag
 * primitive lowered to core: consumed by Resizable, and designed to converge
 * Table column-width dragging + SideBar Container (see Resizable.spec.md §12).
 *
 * Geometry ported from semi-foundation/resizable (single = re-resizable v6.10.0,
 * group = Semi self-authored ResizeGroupFoundation). No framework deps, no
 * reactive attachments — pointer listeners are bound imperatively on start and
 * released on up/destroy (Table redline #3).
 *
 * See specs/components/other/Resizable.spec.md §3.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Eight resize directions (four edges + four corners). */
export type Direction =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'topRight'
  | 'bottomRight'
  | 'bottomLeft'
  | 'topLeft';

/** Ordered list of all eight directions (edges first, then corners). */
export const DIRECTIONS: readonly Direction[] = [
  'top',
  'right',
  'bottom',
  'left',
  'topRight',
  'bottomRight',
  'bottomLeft',
  'topLeft',
] as const;

/** Per-direction enable map. `false` disables every handle. */
export type Enable = Partial<Record<Direction, boolean>>;

/** A size in CSS units (`number` = px). */
export interface Size {
  width?: string | number;
  height?: string | number;
}

/** A resolved numeric size in px. */
export interface NumberSize {
  width: number;
  height: number;
}

/** Drag axis. */
export type ResizeAxis = 'x' | 'y' | 'xy';

/** Group split direction. */
export type GroupDirection = 'horizontal' | 'vertical';

/** Resize progress callback — payload order matches Semi ResizeCallback. */
export type ResizeCallback = (
  size: Size,
  event: PointerEvent,
  direction: Direction,
) => void;

/**
 * Resize-start callback — return `false` to cancel this drag.
 * Matches Semi ResizeStartCallback.
 */
export type ResizeStartCallback = (
  event: PointerEvent,
  direction: Direction,
) => void | boolean;

// ---------------------------------------------------------------------------
// Numeric helpers (ported from semi-foundation/resizable/utils.ts)
// ---------------------------------------------------------------------------

/** Clamp `n` into `[min, max]`. */
export const clamp = (n: number, min: number, max: number): number =>
  Math.max(Math.min(n, max), min);

/** Snap `n` to the nearest multiple of `step`. */
export const snapToGrid = (n: number, step: number): number =>
  step > 0 ? Math.round(n / step) * step : n;

/** Does `dir` contain the edge `target` (case-insensitive substring)? */
export const hasDirection = (
  target: Direction,
  edge: 'top' | 'right' | 'bottom' | 'left',
): boolean => new RegExp(edge, 'i').test(target);

/** Parse a size string/number into px against a parent size. */
export const getPixelSize = (
  size: string | number | undefined,
  parentSize: number,
): number => {
  if (size == null) return NaN;
  if (typeof size === 'number') return size;
  if (size.endsWith('px')) return Number(size.slice(0, -2));
  if (size.endsWith('%')) return (Number(size.slice(0, -1)) / 100) * parentSize;
  return Number(size);
};

// ---------------------------------------------------------------------------
// createResizeDrag — single-drag lifecycle primitive
// ---------------------------------------------------------------------------

export interface ResizeDragBound {
  min?: number | undefined;
  max?: number | undefined;
}

export interface CreateResizeDragOptions {
  /** Which axis this handle drags. */
  axis: ResizeAxis;
  /** The direction this handle represents (for callbacks / lock ratio math). */
  direction?: Direction;
  /** Read the starting size at pointerdown (imperative, never reactive). */
  getStart: () => { width?: number; height?: number };
  /** Clamp bounds (single number = both axes, or per-axis). */
  min?: number | ResizeDragBound;
  max?: number | ResizeDragBound;
  /** Snap step `[x, y]` (or a single step for both). */
  grid?: number | [number, number];
  /** Lock aspect ratio — `true` derives from start size, number = explicit w/h. */
  lockAspectRatio?: boolean | number;
  /** Canvas zoom factor — pointer delta is divided by scale. */
  scale?: number;
  /** Pixel ratio correction — delta multiplied by ratio. */
  ratio?: number | [number, number];
  /** Called at drag start; return `false` from the wrapping caller to cancel. */
  onStart?: (direction: Direction, event: PointerEvent) => void;
  /** Called on every move with the clamped size + delta. */
  onMove?: (
    size: NumberSize,
    delta: { x: number; y: number },
    direction: Direction,
    event: PointerEvent,
  ) => void;
  /** Called at drag end with the final size. */
  onEnd?: (size: NumberSize, direction: Direction, event: PointerEvent) => void;
  /** Document to bind listeners on (defaults to global document). */
  ownerDocument?: Document;
}

export interface ResizeDragController {
  /** Begin a drag from a pointerdown event. */
  start(event: PointerEvent, direction?: Direction): void;
  /** Whether a drag is currently active. */
  isDragging(): boolean;
  /** Detach any live listeners (unmount safety net). */
  destroy(): void;
}

const resolveBound = (
  b: number | ResizeDragBound | undefined,
  axis: 'x' | 'y',
): number | undefined => {
  if (b == null) return undefined;
  if (typeof b === 'number') return b;
  return axis === 'x' ? b.min ?? b.max : b.min ?? b.max;
};

// A bound may carry both min and max; split them explicitly.
const boundOf = (
  b: number | ResizeDragBound | undefined,
  axis: 'x' | 'y',
  kind: 'min' | 'max',
): number | undefined => {
  if (b == null) return undefined;
  if (typeof b === 'number') return b;
  // per-axis object still uses .min/.max as the same value across axes
  void axis;
  return b[kind];
};

/**
 * createResizeDrag — manages one drag's full lifecycle:
 * pointerdown records the start size + start pointer coords → binds
 * pointermove/pointerup on the document → move computes per-axis delta, clamps
 * to min/max (+ optional grid snap / lock-ratio) → up releases → destroy() is
 * an unmount safety net.
 *
 * Covers the Table column-width case (Resizable.spec.md §12.1):
 *   createResizeDrag({ axis: 'x', getStart: () => ({ width: startWidth }),
 *                      min: MIN_COL_WIDTH, onMove: s => set(key, s.width) })
 */
export function createResizeDrag(
  options: CreateResizeDragOptions,
): ResizeDragController {
  const doc: Document | undefined =
    options.ownerDocument ??
    (typeof document !== 'undefined' ? document : undefined);

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startW = 0;
  let startH = 0;
  let dir: Direction = 'right';
  let lockRatio = 1;

  let moveHandler: ((e: PointerEvent) => void) | null = null;
  let upHandler: ((e: PointerEvent) => void) | null = null;

  const minW = boundOf(options.min, 'x', 'min');
  const maxW = boundOf(options.max, 'x', 'max');
  const minH = boundOf(options.min, 'y', 'min');
  const maxH = boundOf(options.max, 'y', 'max');
  // fall back for plain-number bounds (apply to whichever axis is active)
  const singleMin = resolveBound(options.min, 'x');
  const singleMax = resolveBound(options.max, 'x');

  const [gridX, gridY] = Array.isArray(options.grid)
    ? options.grid
    : options.grid != null
      ? [options.grid, options.grid]
      : [0, 0];

  const scale = options.scale && options.scale !== 0 ? options.scale : 1;
  const [ratioX, ratioY] = Array.isArray(options.ratio)
    ? options.ratio
    : [options.ratio ?? 1, options.ratio ?? 1];

  function detach(): void {
    if (doc && moveHandler) doc.removeEventListener('pointermove', moveHandler);
    if (doc && upHandler) doc.removeEventListener('pointerup', upHandler);
    moveHandler = null;
    upHandler = null;
  }

  function computeSize(clientX: number, clientY: number): NumberSize {
    const dx = ((clientX - startX) * ratioX) / scale;
    const dy = ((clientY - startY) * ratioY) / scale;

    let w = startW;
    let h = startH;

    const usesX = options.axis === 'x' || options.axis === 'xy';
    const usesY = options.axis === 'y' || options.axis === 'xy';

    if (usesX) {
      // left edge grows toward negative delta
      w = hasDirection(dir, 'left') ? startW - dx : startW + dx;
    }
    if (usesY) {
      h = hasDirection(dir, 'top') ? startH - dy : startH + dy;
    }

    // grid snap
    if (gridX > 0) w = snapToGrid(w, gridX);
    if (gridY > 0) h = snapToGrid(h, gridY);

    // clamp — per-axis bounds win, else the single-number bound
    const lo_w = minW ?? (options.axis !== 'y' ? singleMin : undefined);
    const hi_w = maxW ?? (options.axis !== 'y' ? singleMax : undefined);
    const lo_h = minH ?? (options.axis === 'y' ? singleMin : undefined);
    const hi_h = maxH ?? (options.axis === 'y' ? singleMax : undefined);

    if (usesX) w = clamp(w, lo_w ?? -Infinity, hi_w ?? Infinity);
    if (usesY) h = clamp(h, lo_h ?? -Infinity, hi_h ?? Infinity);

    // lock aspect ratio (after individual clamps, derive the driven axis)
    if (options.lockAspectRatio) {
      if (options.axis === 'xy') {
        // corner drag: drive height from width when horizontal edge present
        if (hasDirection(dir, 'left') || hasDirection(dir, 'right')) {
          h = w / lockRatio;
        } else {
          w = h * lockRatio;
        }
      }
    }

    return { width: Math.round(w), height: Math.round(h) };
  }

  return {
    start(event: PointerEvent, direction?: Direction): void {
      if (dragging) return;
      dir = direction ?? options.direction ?? 'right';
      const s = options.getStart();
      startW = s.width ?? 0;
      startH = s.height ?? 0;
      startX = event.clientX;
      startY = event.clientY;
      lockRatio =
        typeof options.lockAspectRatio === 'number'
          ? options.lockAspectRatio
          : startH !== 0
            ? startW / startH
            : 1;
      dragging = true;

      options.onStart?.(dir, event);

      moveHandler = (e: PointerEvent) => {
        if (!dragging) return;
        const size = computeSize(e.clientX, e.clientY);
        options.onMove?.(
          size,
          { x: e.clientX - startX, y: e.clientY - startY },
          dir,
          e,
        );
      };
      upHandler = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        const size = computeSize(e.clientX, e.clientY);
        detach();
        options.onEnd?.(size, dir, e);
      };

      if (doc) {
        doc.addEventListener('pointermove', moveHandler);
        doc.addEventListener('pointerup', upHandler);
      }
    },
    isDragging(): boolean {
      return dragging;
    },
    destroy(): void {
      dragging = false;
      detach();
    },
  };
}

// ---------------------------------------------------------------------------
// Group geometry (ported from semi-foundation/resizable/group/index.ts)
// ---------------------------------------------------------------------------

/**
 * Read padding+border offset in the split direction from a computed style.
 * Ported from Semi getOffset.
 */
export const getOffset = (
  style: CSSStyleDeclaration,
  direction: GroupDirection,
): number => {
  if (direction === 'horizontal') {
    return (
      (parseFloat(style.paddingLeft) || 0) +
      (parseFloat(style.paddingRight) || 0) +
      (parseFloat(style.borderLeftWidth) || 0) +
      (parseFloat(style.borderRightWidth) || 0)
    );
  }
  return (
    (parseFloat(style.paddingTop) || 0) +
    (parseFloat(style.paddingBottom) || 0) +
    (parseFloat(style.borderTopWidth) || 0) +
    (parseFloat(style.borderBottomWidth) || 0)
  );
};

/**
 * Is `newSize` outside `[min+offset, max]` (as px against parentSize)?
 * Ported from Semi judgeConstraint.
 */
export const judgeConstraint = (
  newSize: number,
  min: string | number | undefined,
  max: string | number | undefined,
  parentSize: number,
  offset = 0,
): boolean => {
  const minSize = getPixelSize(min ?? '0%', parentSize);
  const maxSize = getPixelSize(max ?? '100%', parentSize);
  if (newSize < minSize + offset) return true;
  if (newSize > maxSize) return true;
  return false;
};

/**
 * Clamp `newSize` into `[min+offset, max]`. Ported from Semi adjustNewSize.
 */
export const adjustNewSize = (
  newSize: number,
  min: string | number | undefined,
  max: string | number | undefined,
  parentSize: number,
  offset = 0,
): number => {
  const minSize = getPixelSize(min ?? '0%', parentSize);
  const maxSize = getPixelSize(max ?? '100%', parentSize);
  if (newSize < minSize + offset) return minSize + offset;
  if (newSize > maxSize) return maxSize;
  return newSize;
};

/** Per-item constraint used by computeGroupResize. */
export interface GroupItemConstraint {
  min?: string | number | undefined;
  max?: string | number | undefined;
  /** padding/border offset + half-handler minus (px). */
  offset?: number | undefined;
}

export interface ComputeGroupResizeInput {
  /** Split direction. */
  direction: GroupDirection;
  /** Total px size of the group in the split direction. */
  parentSize: number;
  /** Pixel delta along the split axis (clientX-initX or clientY-initY). */
  delta: number;
  /** Starting px size of the last (index) item. */
  lastItemSize: number;
  /** Starting px size of the next (index+1) item. */
  nextItemSize: number;
  /** Starting percent of the last item (for float-error-free bookkeeping). */
  lastItemPercent: number;
  /** Starting percent of the next item. */
  nextItemPercent: number;
  last: GroupItemConstraint;
  next: GroupItemConstraint;
}

export interface ComputeGroupResizeResult {
  /** New px size of the last item. */
  lastNewSize: number;
  /** New px size of the next item. */
  nextNewSize: number;
  /** New percent of the last item. */
  lastNewPercent: number;
  /** New percent of the next item (= sum − lastNewPercent, conserved). */
  nextNewPercent: number;
}

/**
 * computeGroupResize — the split-group coupling geometry (ported verbatim from
 * Semi ResizeGroupFoundation.onResizing):
 *   lastNewSize = lastItemSize + delta,  nextNewSize = nextItemSize − delta
 * (one grows, one shrinks; their sum is conserved). If either goes out of
 * bounds, that item is clamped via adjustNewSize and the other is set to
 * `sum − clampedItem` to preserve the total. Percentages are tracked in a Map
 * by the caller to eliminate float error.
 */
export function computeGroupResize(
  input: ComputeGroupResizeInput,
): ComputeGroupResizeResult {
  const {
    parentSize,
    delta,
    lastItemSize,
    nextItemSize,
    lastItemPercent,
    nextItemPercent,
    last,
    next,
  } = input;

  let lastNewSize = lastItemSize + delta;
  let nextNewSize = nextItemSize - delta;

  const lastOffset = last.offset ?? 0;
  const nextOffset = next.offset ?? 0;

  const lastFlag = judgeConstraint(
    lastNewSize,
    last.min,
    last.max,
    parentSize,
    lastOffset,
  );
  const nextFlag = judgeConstraint(
    nextNewSize,
    next.min,
    next.max,
    parentSize,
    nextOffset,
  );

  if (lastFlag) {
    lastNewSize = adjustNewSize(
      lastNewSize,
      last.min,
      last.max,
      parentSize,
      lastOffset,
    );
    nextNewSize = lastItemSize + nextItemSize - lastNewSize;
  }

  if (nextFlag) {
    nextNewSize = adjustNewSize(
      nextNewSize,
      next.min,
      next.max,
      parentSize,
      nextOffset,
    );
    lastNewSize = lastItemSize + nextItemSize - nextNewSize;
  }

  const lastNewPercent = (lastNewSize / parentSize) * 100;
  // conserve: derive next from the invariant sum to kill float drift
  const nextNewPercent = lastItemPercent + nextItemPercent - lastNewPercent;

  return { lastNewSize, nextNewSize, lastNewPercent, nextNewPercent };
}
