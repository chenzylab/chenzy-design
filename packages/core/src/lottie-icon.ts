/**
 * createLottieIcon helpers — framework-agnostic Lottie icon logic.
 * Pure decision functions (reduced-motion resolution, size mapping, autoplay
 * gating) plus a player-adapter interface so the library never hard-depends on
 * lottie-web — consumers inject any player. The svelte layer owns the mount
 * node + adapter lifecycle. See specs/components/other/LottieIcon.spec.md §3
 * (dependency-injected adapter; src fetch / visible / segments deferred).
 */

export type LottieTrigger = 'auto' | 'hover' | 'manual';
export type LottieSize = 'small' | 'default' | 'large';

/** Minimal player adapter the host injects (e.g. wrapping lottie-web). */
export interface LottiePlayerAdapter {
  play(): void;
  pause(): void;
  stop(): void;
  /** jump to a specific frame and hold (used for reduced-motion static frame) */
  goToFrame?(frame: number): void;
  destroy(): void;
}

/** Factory the host passes: builds an adapter for the given container + data. */
export type LottiePlayerFactory = (config: {
  container: HTMLElement;
  data: unknown;
  loop: boolean | number;
  autoplay: boolean;
  speed: number;
}) => LottiePlayerAdapter;

const SIZE_PX: Record<LottieSize, number> = { small: 16, default: 20, large: 24 };

/** Map a size token (or raw px number) to a pixel value. */
export function resolveSize(size: LottieSize | number): number {
  return typeof size === 'number' ? size : SIZE_PX[size];
}

/**
 * Resolve whether animation should run: an explicit `reducedMotion` prop wins;
 * otherwise follow the system `prefers-reduced-motion`. Returns true when
 * animation is ALLOWED (i.e. NOT reduced).
 */
export function resolveAnimated(
  reducedMotionProp: boolean | undefined,
  systemReduced: boolean,
): boolean {
  if (reducedMotionProp !== undefined) return !reducedMotionProp;
  return !systemReduced;
}

/**
 * Should the icon start playing on mount, given trigger + autoplay + whether
 * animation is allowed (reduced-motion). Only `auto` honors autoplay; hover &
 * manual never autoplay.
 */
export function shouldAutoplay(
  trigger: LottieTrigger,
  autoplay: boolean,
  animated: boolean,
): boolean {
  if (!animated) return false;
  return trigger === 'auto' && autoplay;
}
