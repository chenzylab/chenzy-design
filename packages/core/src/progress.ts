/**
 * createProgress helpers — framework-agnostic progress math & a11y.
 * Pure functions only: percent clamping, status resolution, circle/dashboard
 * SVG geometry, and progressbar aria props. No DOM, no framework deps.
 * See specs/components/feedback/Progress.spec.md §3.
 */

export type ProgressStatus = 'normal' | 'success' | 'error' | 'warning';
export type ProgressType = 'line' | 'circle' | 'dashboard';
export type GapPosition = 'top' | 'bottom' | 'left' | 'right';

/** Clamp any input to an integer-friendly 0..100 (NaN/±∞ → 0/100). */
export function clampPercent(percent: number): number {
  if (Number.isNaN(percent)) return 0;
  if (percent < 0) return 0;
  if (percent > 100) return 100;
  return percent;
}

/**
 * Resolve the effective status. When status is left at 'normal' and the bar is
 * full, optionally promote to 'success' (successWhenFull). An explicitly set
 * error/warning/success is always respected.
 */
export function resolveStatus(
  percent: number,
  status: ProgressStatus,
  successWhenFull = false,
): ProgressStatus {
  if (status !== 'normal') return status;
  if (successWhenFull && clampPercent(percent) >= 100) return 'success';
  return 'normal';
}

export interface CirclePathInput {
  /** diameter in px */
  width: number;
  /** stroke width in px */
  strokeWidth: number;
  /** percent 0..100 */
  percent: number;
  /** open-gap angle for dashboard (0 for full circle) */
  gapDegree?: number;
  gapPosition?: GapPosition;
}

export interface CirclePathProps {
  radius: number;
  /** center coordinate (width/2) */
  center: number;
  /** full stroke length of the track (accounting for the gap) */
  circumference: number;
  /** dasharray for the track */
  trackDash: string;
  /** dashoffset for the filled stroke (maps percent → arc length) */
  fillDash: string;
  /** rotation transform so the start sits at the right place */
  rotation: number;
}

/** rotation (deg) that places the gap/start according to gapPosition */
function startRotation(gapPosition: GapPosition, gapDegree: number): number {
  // base: a full circle starts at 3 o'clock; rotate -90 to start at top.
  switch (gapPosition) {
    case 'top':
      return -90 + gapDegree / 2;
    case 'bottom':
      return 90 + gapDegree / 2;
    case 'left':
      return 180 + gapDegree / 2;
    case 'right':
      return 0 + gapDegree / 2;
    default:
      return 90 + gapDegree / 2;
  }
}

/**
 * Compute SVG geometry for circle/dashboard. The visible track spans
 * (360 - gapDegree) degrees; the fill covers `percent`% of that span.
 */
export function getCirclePathProps(input: CirclePathInput): CirclePathProps {
  const { width, strokeWidth, gapDegree = 0, gapPosition = 'bottom' } = input;
  const percent = clampPercent(input.percent);
  const center = width / 2;
  const radius = center - strokeWidth / 2;
  const perimeter = 2 * Math.PI * radius;

  // visible portion of the perimeter (full perimeter minus the gap)
  const visibleRatio = (360 - gapDegree) / 360;
  const visibleLen = perimeter * visibleRatio;
  const gapLen = perimeter - visibleLen;

  // track: draw visibleLen, then leave gapLen empty
  const trackDash = `${visibleLen} ${gapLen}`;
  // fill: draw percent% of the visible length, rest is offset
  const fillLen = (visibleLen * percent) / 100;
  const fillDash = `${fillLen} ${perimeter - fillLen}`;

  return {
    radius,
    center,
    circumference: perimeter,
    trackDash,
    fillDash,
    rotation: startRotation(gapPosition, gapDegree),
  };
}

export interface RootAriaInput {
  percent: number;
  indeterminate?: boolean;
  label?: string;
  valueText?: string;
}

export interface RootAriaProps {
  role: 'progressbar';
  'aria-valuemin': 0;
  'aria-valuemax': 100;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  'aria-label'?: string;
  'aria-busy'?: true;
}

/** Build progressbar aria props; indeterminate omits valuenow + sets busy. */
export function getRootAriaProps(input: RootAriaInput): RootAriaProps {
  const props: RootAriaProps = {
    role: 'progressbar',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
  };
  if (input.indeterminate) {
    props['aria-busy'] = true;
  } else {
    props['aria-valuenow'] = clampPercent(input.percent);
    if (input.valueText) props['aria-valuetext'] = input.valueText;
  }
  if (input.label) props['aria-label'] = input.label;
  return props;
}
