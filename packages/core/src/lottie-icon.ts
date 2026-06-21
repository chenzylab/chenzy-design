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

/**
 * Render backend the injected player should use. Mirrors lottie-web's
 * `renderer` option ('svg' | 'canvas' | 'html'). Optional everywhere so legacy
 * factories that ignore it keep their default ('svg') behaviour.
 */
export type LottieRenderer = 'svg' | 'canvas' | 'html';

/**
 * Frame segment to play: a `[start, end]` frame pair, or a named marker string
 * resolved against the animation data's `markers`. See `resolveSegments`.
 */
export type LottieSegments = [number, number] | string;

/** Minimal player adapter the host injects (e.g. wrapping lottie-web). */
export interface LottiePlayerAdapter {
  play(): void;
  pause(): void;
  stop(): void;
  /** jump to a specific frame and hold (used for reduced-motion static frame) */
  goToFrame?(frame: number): void;
  /**
   * Play a resolved `[start, end]` frame segment. Optional: when the injected
   * player lacks it, the host falls back to `play()`. The svelte layer always
   * passes a numeric pair (named markers resolved via `resolveSegments`).
   */
  playSegments?(segments: [number, number]): void;
  destroy(): void;
}

/** Factory the host passes: builds an adapter for the given container + data. */
export type LottiePlayerFactory = (config: {
  container: HTMLElement;
  data: unknown;
  loop: boolean | number;
  autoplay: boolean;
  speed: number;
  /** Resolved initial `[start, end]` frame segment, when `segments` is set. */
  segment?: [number, number];
  /**
   * Render backend ('svg' | 'canvas' | 'html'), forwarded to e.g. lottie-web's
   * `renderer` option. Optional & backward-compatible: omitted when the host's
   * `canvas`/`renderer` prop is unset, so legacy factories default to 'svg'.
   */
  renderer?: LottieRenderer;
}) => LottiePlayerAdapter;

/**
 * Resolve the host `canvas` / `renderer` prop into a concrete renderer backend
 * for the factory (pure). `renderer` (explicit string) wins; otherwise
 * `canvas === true` → 'canvas'. Returns `undefined` when neither is set so the
 * host omits `renderer` entirely and legacy factories keep their 'svg' default.
 */
export function resolveRenderer(
  canvas: boolean | undefined,
  renderer: LottieRenderer | undefined,
): LottieRenderer | undefined {
  if (renderer != null) return renderer;
  if (canvas === true) return 'canvas';
  return undefined;
}

/** A Lottie marker entry (subset) as found in animation data `markers`. */
interface LottieMarker {
  cm?: string;
  tm?: number;
  dr?: number;
}

/**
 * Resolve a `segments` prop into a concrete `[start, end]` frame pair.
 * - `[start, end]` numeric pair → returned as-is.
 * - marker name string → looked up in the data's `markers` (`cm` name,
 *   `tm` start time, `dr` duration); resolves to `[tm, tm + dr]`.
 * Returns `null` when unresolvable (no markers / name not found / bad input)
 * so the host can fall back to playing the whole animation.
 */
export function resolveSegments(
  segments: LottieSegments | undefined,
  data: unknown,
): [number, number] | null {
  if (segments == null) return null;
  if (Array.isArray(segments)) {
    const [start, end] = segments;
    if (typeof start === 'number' && typeof end === 'number' && Number.isFinite(start) && Number.isFinite(end)) {
      return [start, end];
    }
    return null;
  }
  if (typeof segments !== 'string') return null;
  const markers = (data as { markers?: LottieMarker[] } | null | undefined)?.markers;
  if (!Array.isArray(markers)) return null;
  const marker = markers.find((m) => m && m.cm === segments);
  if (!marker || typeof marker.tm !== 'number') return null;
  const start = marker.tm;
  const end = start + (typeof marker.dr === 'number' ? marker.dr : 0);
  return [start, end];
}

/**
 * Is `src` a usable animation source URL (non-empty string). Pure guard used
 * by the host to decide whether to kick off a fetch.
 */
export function isLottieSrc(src: unknown): src is string {
  return typeof src === 'string' && src.trim().length > 0;
}

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
