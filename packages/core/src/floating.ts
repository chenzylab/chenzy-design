/**
 * floating — framework-agnostic popup positioning. Pure geometry: given the
 * trigger/popup rects, the viewport, a desired placement and offset, it returns
 * the fixed-viewport (x, y) for the popup, the placement actually used after
 * collision flipping, and the arrow's cross-axis offset. No DOM, no framework.
 *
 * Coordinate space: all rects are in viewport coordinates (as from
 * getBoundingClientRect), so the returned (x, y) is meant for `position: fixed`.
 * See specs/components/show/Tooltip.spec.md / Popover.spec.md (autoAdjustOverflow).
 */

/** 12-way placement: <side><align?>. align omitted = centered on cross axis. */
export type Placement =
  | 'top'
  | 'topStart'
  | 'topEnd'
  | 'bottom'
  | 'bottomStart'
  | 'bottomEnd'
  | 'left'
  | 'leftStart'
  | 'leftEnd'
  | 'right'
  | 'rightStart'
  | 'rightEnd';

export type Side = 'top' | 'bottom' | 'left' | 'right';
export type Align = 'start' | 'center' | 'end';

/** minimal rect shape (compatible with DOMRect) */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface ComputePositionInput {
  triggerRect: Rect;
  popupRect: Rect;
  viewport: Viewport;
  placement: Placement;
  /** gap between trigger and popup along the main axis (px) */
  offset?: number;
  /** flip to the opposite side when the chosen side overflows the viewport */
  autoAdjust?: boolean;
  /** keep the popup at least this far from the viewport edge (px) */
  padding?: number;
}

export interface ComputePositionResult {
  /** fixed-viewport x of the popup's top-left corner */
  x: number;
  /** fixed-viewport y of the popup's top-left corner */
  y: number;
  /** placement after collision flipping (may differ from the requested one) */
  placement: Placement;
  /** the resolved side after flipping */
  side: Side;
  /** the resolved align */
  align: Align;
  /**
   * cross-axis offset (px) from the popup's leading edge to where the arrow's
   * center should sit, so the arrow keeps pointing at the trigger's center.
   */
  arrowOffset: number;
}

/** split a Placement into its side + align parts. */
export function parsePlacement(placement: Placement): { side: Side; align: Align } {
  if (placement.startsWith('top')) return { side: 'top', align: alignOf(placement, 'top') };
  if (placement.startsWith('bottom'))
    return { side: 'bottom', align: alignOf(placement, 'bottom') };
  if (placement.startsWith('left')) return { side: 'left', align: alignOf(placement, 'left') };
  return { side: 'right', align: alignOf(placement, 'right') };
}

function alignOf(placement: Placement, side: Side): Align {
  const suffix = placement.slice(side.length);
  if (suffix === 'Start') return 'start';
  if (suffix === 'End') return 'end';
  return 'center';
}

/** recompose a side + align into a Placement. */
export function makePlacement(side: Side, align: Align): Placement {
  if (align === 'center') return side;
  const suffix = align === 'start' ? 'Start' : 'End';
  return (side + suffix) as Placement;
}

const OPPOSITE: Record<Side, Side> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/** is the side along the vertical (block) axis? top/bottom → true */
function isVerticalSide(side: Side): boolean {
  return side === 'top' || side === 'bottom';
}

/** free space between the trigger and the viewport edge on a given side. */
function spaceOnSide(side: Side, trigger: Rect, viewport: Viewport): number {
  switch (side) {
    case 'top':
      return trigger.y;
    case 'bottom':
      return viewport.height - (trigger.y + trigger.height);
    case 'left':
      return trigger.x;
    case 'right':
      return viewport.width - (trigger.x + trigger.width);
  }
}

/** popup extent needed along the main axis for a side (including the offset). */
function neededOnSide(side: Side, popup: Rect, offset: number): number {
  return (isVerticalSide(side) ? popup.height : popup.width) + offset;
}

/**
 * choose the final side: keep the requested one unless autoAdjust is on and it
 * overflows while the opposite side has strictly more room.
 */
function resolveSide(
  side: Side,
  input: Required<Pick<ComputePositionInput, 'offset' | 'padding'>> & ComputePositionInput,
): Side {
  if (!input.autoAdjust) return side;
  const { triggerRect, popupRect, viewport, offset } = input;
  const need = neededOnSide(side, popupRect, offset);
  const have = spaceOnSide(side, triggerRect, viewport);
  if (have >= need) return side;
  const opp = OPPOSITE[side];
  const oppHave = spaceOnSide(opp, triggerRect, viewport);
  return oppHave > have ? opp : side;
}

/**
 * main-axis coordinate of the popup's leading corner (top for top/bottom-x,
 * left for left/right-y), placing the popup `offset` away from the trigger.
 */
function mainAxisCoord(side: Side, trigger: Rect, popup: Rect, offset: number): number {
  switch (side) {
    case 'top':
      return trigger.y - popup.height - offset;
    case 'bottom':
      return trigger.y + trigger.height + offset;
    case 'left':
      return trigger.x - popup.width - offset;
    case 'right':
      return trigger.x + trigger.width + offset;
  }
}

/**
 * cross-axis coordinate of the popup's leading corner given the align.
 * For vertical sides the cross axis is horizontal (x); for horizontal sides it
 * is vertical (y).
 */
function crossAxisCoord(side: Side, align: Align, trigger: Rect, popup: Rect): number {
  const vertical = isVerticalSide(side);
  const triggerStart = vertical ? trigger.x : trigger.y;
  const triggerSize = vertical ? trigger.width : trigger.height;
  const popupSize = vertical ? popup.width : popup.height;
  switch (align) {
    case 'start':
      return triggerStart;
    case 'end':
      return triggerStart + triggerSize - popupSize;
    case 'center':
      return triggerStart + triggerSize / 2 - popupSize / 2;
  }
}

/** clamp a value into [min, max]; if the range is empty returns min. */
function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Compute the popup's fixed-viewport position with optional collision flipping
 * and viewport-edge clamping along the cross axis. Pure function.
 */
export function computePosition(input: ComputePositionInput): ComputePositionResult {
  const offset = input.offset ?? 8;
  const padding = input.padding ?? 4;
  const filled = { ...input, offset, padding };

  const requested = parsePlacement(input.placement);
  const side = resolveSide(requested.side, filled);
  const align = requested.align;

  const { triggerRect, popupRect, viewport } = input;

  let x: number;
  let y: number;
  if (isVerticalSide(side)) {
    y = mainAxisCoord(side, triggerRect, popupRect, offset);
    const rawX = crossAxisCoord(side, align, triggerRect, popupRect);
    x = clamp(rawX, padding, viewport.width - popupRect.width - padding);
  } else {
    x = mainAxisCoord(side, triggerRect, popupRect, offset);
    const rawY = crossAxisCoord(side, align, triggerRect, popupRect);
    y = clamp(rawY, padding, viewport.height - popupRect.height - padding);
  }

  // arrow points at the trigger center; offset is measured from the popup's
  // leading cross-axis edge to that center, clamped inside the popup.
  const vertical = isVerticalSide(side);
  const triggerCenter = vertical
    ? triggerRect.x + triggerRect.width / 2
    : triggerRect.y + triggerRect.height / 2;
  const popupLeadingEdge = vertical ? x : y;
  const popupCrossSize = vertical ? popupRect.width : popupRect.height;
  const arrowOffset = clamp(triggerCenter - popupLeadingEdge, padding, popupCrossSize - padding);

  return { x, y, placement: makePlacement(side, align), side, align, arrowOffset };
}
