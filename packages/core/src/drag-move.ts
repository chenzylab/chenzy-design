/**
 * drag-move — framework-agnostic drag-to-move geometry primitive for the
 * DragMove component. Second shared drag primitive lowered to core (after
 * createResizeDrag): moves an element's position within an optional constrainer
 * region. Designed to converge Modal's draggable title bar + Cropper's canvas
 * drag (see specs/components/other/DragMove.spec.md §12).
 *
 * Geometry ported from semi-foundation/dragMove/foundation. No framework deps,
 * no reactive attachments — the start listener is bound on the handler and the
 * document move/up listeners are bound imperatively on pointerdown and released
 * on up/destroy (DragMove.spec.md §3, redline #3).
 *
 * Unlike createResizeDrag (which changes size), createDragMove changes the
 * element's top/left position, clamping into the constrainer bounds.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamp `value` into `[min, max]`. */
export const clampValueInRange = (
  value: number,
  min: number,
  max: number,
): number => Math.min(Math.max(value, min), max);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Resolve the drag element (the element that actually moves). */
export type DragMoveElementGetter = () => HTMLElement | null;

/** Resolve the handler (drag-trigger) element; defaults to the drag element. */
export type DragMoveHandlerGetter = () => HTMLElement | null;

/**
 * Resolve the constrainer: the element whose box bounds the movement.
 * Return `null` for no constraint (free move within the viewport).
 */
export type DragMoveConstrainerGetter = () => HTMLElement | null;

/**
 * Predicate deciding whether a given pointerdown should start a drag.
 * Return `false` to cancel this drag. Receives the originating event and the
 * drag element.
 */
export type DragMoveAllow = (
  event: MouseEvent | TouchEvent,
  element: HTMLElement,
) => boolean;

/**
 * Custom position applier. When provided, DragMove does NOT write
 * `el.style.top/left` itself; the caller applies the new position however it
 * likes (payload order matches Semi customMove: `(el, top, left)`).
 */
export type DragMoveCustomMove = (
  element: HTMLElement,
  top: number,
  left: number,
) => void;

export interface CreateDragMoveOptions {
  /** Resolve the element that moves (imperative, never reactive). */
  handler?: DragMoveHandlerGetter;
  /** Resolve the drag element. Required — the thing whose position changes. */
  getElement: DragMoveElementGetter;
  /** Resolve the constrainer box, or `null` for no constraint. */
  constrainer?: DragMoveConstrainerGetter;
  /** Gate a drag; return `false` to cancel. */
  allowMove?: DragMoveAllow;
  /** Apply the new position yourself (else DragMove writes style.top/left). */
  customMove?: DragMoveCustomMove;
  /**
   * Allow starting a drag from a form control (`<input>`/`<textarea>`).
   * Default `false` so text selection is not hijacked.
   */
  allowInputDrag?: boolean;
  /** Called at drag start (after allowMove passes) with the origin event. */
  onStart?: (event: MouseEvent | TouchEvent, element: HTMLElement) => void;
  /** Called on every move with the clamped position + origin event. */
  onMove?: (
    top: number,
    left: number,
    event: MouseEvent | TouchEvent,
    element: HTMLElement,
  ) => void;
  /** Called at drag end. */
  onEnd?: (event: MouseEvent | TouchEvent, element: HTMLElement) => void;
  /** Pointer-event passthrough (mirrors Semi notify* adapter hooks). */
  onMouseDown?: (e: MouseEvent) => void;
  onMouseMove?: (e: MouseEvent) => void;
  onMouseUp?: (e: MouseEvent) => void;
  onTouchStart?: (e: TouchEvent) => void;
  onTouchMove?: (e: TouchEvent) => void;
  onTouchEnd?: (e: TouchEvent) => void;
  onTouchCancel?: (e: TouchEvent) => void;
  /** Document to bind listeners on (defaults to the global document). */
  ownerDocument?: Document;
}

export interface DragMoveController {
  /**
   * Register the pointerdown/touchstart listener on the handler element and
   * force it to `position: absolute` so top/left take effect. Idempotent.
   */
  init(): void;
  /** Whether a drag is currently active. */
  isDragging(): boolean;
  /** Detach handler + any live document listeners (unmount safety net). */
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

export interface MoveRange {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/**
 * Compute the pixel range within which `element` may move so it stays inside
 * `constrainer`. Ported from semi-foundation dragMove `_calcMoveRange`: walks
 * offsetParent chain from the element up to the constrainer, accumulating the
 * offset, then derives min/max from the constrainer box minus the element box.
 * Returns `null` when there is no constrainer (free move).
 */
export const calcMoveRange = (
  element: HTMLElement,
  constrainer: HTMLElement | null,
): MoveRange | null => {
  if (!constrainer) return null;
  let node = element.offsetParent as HTMLElement | null;
  let startX = 0;
  let startY = 0;
  while (node !== constrainer && node !== null) {
    startX -= node.offsetLeft;
    startY -= node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return {
    xMin: startX,
    xMax: startX + constrainer.offsetWidth - element.offsetWidth,
    yMin: startY,
    yMax: startY + constrainer.offsetHeight - element.offsetHeight,
  };
};

/**
 * Given the pointer position, the recorded start offset, and an optional move
 * range, compute the clamped `{ top, left }` for the element. Pure — no DOM
 * writes, so it is trivially unit-testable.
 */
export const computeNextPosition = (
  clientX: number,
  clientY: number,
  startOffsetX: number,
  startOffsetY: number,
  range: MoveRange | null,
): { top: number; left: number } => {
  let left = clientX - startOffsetX;
  let top = clientY - startOffsetY;
  if (range) {
    left = clampValueInRange(left, range.xMin, range.xMax);
    top = clampValueInRange(top, range.yMin, range.yMax);
  }
  return { top, left };
};

// ---------------------------------------------------------------------------
// createDragMove — drag-to-move lifecycle primitive
// ---------------------------------------------------------------------------

/**
 * createDragMove — manages the full drag-to-move lifecycle:
 * `init()` binds mousedown/touchstart on the handler and forces the drag
 * element to `position: absolute`. On pointerdown it records the pointer→element
 * offset + move range, binds document move/up listeners, then each move computes
 * the clamped position and applies it (via `customMove` or `style.top/left`),
 * and up releases the document listeners. `destroy()` is an unmount safety net.
 *
 * Covers the Modal draggable-title-bar case (DragMove.spec.md §12): supply a
 * `handler` returning the title bar, `getElement` returning the dialog, and a
 * `constrainer` returning the viewport/parent.
 */
export function createDragMove(
  options: CreateDragMoveOptions,
): DragMoveController {
  const doc: Document | undefined =
    options.ownerDocument ??
    (typeof document !== 'undefined' ? document : undefined);

  let element: HTMLElement | null = null;
  let handlerEl: HTMLElement | null = null;
  let dragging = false;
  let startOffsetX = 0;
  let startOffsetY = 0;
  let range: MoveRange | null = null;
  let initialized = false;

  const resolveHandler = (): HTMLElement | null => {
    if (options.handler) return options.handler();
    return options.getElement();
  };

  const allow = (e: MouseEvent | TouchEvent): boolean => {
    // Clicking an input/textarea should be allowed, but dragging from it
    // should not (avoids hijacking text selection) unless opted in.
    if (!options.allowInputDrag) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return false;
    }
    if (!element) return false;
    if (options.allowMove) return options.allowMove(e, element);
    return true;
  };

  const calcOffset = (point: { clientX: number; clientY: number }): void => {
    if (!element) return;
    startOffsetX = point.clientX - element.offsetLeft;
    startOffsetY = point.clientY - element.offsetTop;
  };

  const applyPosition = (
    point: { clientX: number; clientY: number },
    e: MouseEvent | TouchEvent,
  ): void => {
    if (!element) return;
    const { top, left } = computeNextPosition(
      point.clientX,
      point.clientY,
      startOffsetX,
      startOffsetY,
      range,
    );
    if (options.customMove) {
      options.customMove(element, top, left);
    } else {
      element.style.top = `${top}px`;
      element.style.left = `${left}px`;
    }
    options.onMove?.(top, left, e, element);
  };

  const onMouseMove = (e: MouseEvent): void => {
    if (!dragging) return;
    options.onMouseMove?.(e);
    applyPosition(e, e);
  };

  const onTouchMove = (e: TouchEvent): void => {
    if (!dragging) return;
    options.onTouchMove?.(e);
    const touch = e.targetTouches[0];
    if (touch) applyPosition(touch, e);
  };

  const detachMouse = (): void => {
    doc?.removeEventListener('mousemove', onMouseMove);
    doc?.removeEventListener('mouseup', onMouseUp);
  };

  const detachTouch = (): void => {
    doc?.removeEventListener('touchmove', onTouchMove);
    doc?.removeEventListener('touchend', onTouchEnd);
    doc?.removeEventListener('touchcancel', onTouchCancel);
  };

  function onMouseUp(e: MouseEvent): void {
    dragging = false;
    options.onMouseUp?.(e);
    detachMouse();
    if (element) options.onEnd?.(e, element);
  }

  function onTouchEnd(e: TouchEvent): void {
    dragging = false;
    options.onTouchEnd?.(e);
    detachTouch();
    if (element) options.onEnd?.(e, element);
  }

  function onTouchCancel(e: TouchEvent): void {
    dragging = false;
    options.onTouchCancel?.(e);
    detachTouch();
    if (element) options.onEnd?.(e, element);
  }

  const onMouseDown = (e: MouseEvent): void => {
    if (!element) return;
    range = calcMoveRange(element, options.constrainer?.() ?? null);
    options.onMouseDown?.(e);
    if (!allow(e)) return;
    dragging = true;
    calcOffset(e);
    options.onStart?.(e, element);
    if (doc) {
      doc.addEventListener('mousemove', onMouseMove);
      doc.addEventListener('mouseup', onMouseUp);
    }
    // prevent default so other elements (img/text) are not selected
    e.preventDefault();
  };

  const onTouchStart = (e: TouchEvent): void => {
    if (!element) return;
    range = calcMoveRange(element, options.constrainer?.() ?? null);
    options.onTouchStart?.(e);
    if (!allow(e)) return;
    const touch = e.targetTouches[0];
    if (!touch) return;
    dragging = true;
    calcOffset(touch);
    options.onStart?.(e, element);
    if (doc) {
      doc.addEventListener('touchmove', onTouchMove);
      doc.addEventListener('touchend', onTouchEnd);
      doc.addEventListener('touchcancel', onTouchCancel);
    }
    e.preventDefault();
  };

  const unregisterStart = (): void => {
    handlerEl?.removeEventListener('mousedown', onMouseDown);
    handlerEl?.removeEventListener('touchstart', onTouchStart);
  };

  return {
    init(): void {
      if (initialized) return;
      element = options.getElement();
      if (!element) {
        throw new Error('DragMove: drag element must be a valid element');
      }
      handlerEl = resolveHandler() ?? element;
      element.style.position = 'absolute';
      handlerEl.addEventListener('mousedown', onMouseDown);
      handlerEl.addEventListener('touchstart', onTouchStart);
      initialized = true;
    },
    isDragging(): boolean {
      return dragging;
    },
    destroy(): void {
      dragging = false;
      unregisterStart();
      detachMouse();
      detachTouch();
      initialized = false;
    },
  };
}
