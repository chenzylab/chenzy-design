/**
 * Roving tabindex helpers — framework-agnostic, pure functions only.
 *
 * The render layer owns the focused index ($state) and the actual DOM focus()
 * call; these helpers only compute the *next* focused index from a key press.
 * See the WAI-ARIA roving tabindex pattern.
 */

export type RovingKey = 'prev' | 'next' | 'first' | 'last';

/**
 * Map a keyboard event key to a roving navigation intent, or null when the key
 * is not a navigation key. Both orientations are accepted so a single mapping
 * works for vertical (↑/↓) and horizontal (←/→) timelines.
 */
export function rovingKeyFromEvent(key: string): RovingKey | null {
  switch (key) {
    case 'ArrowUp':
    case 'ArrowLeft':
      return 'prev';
    case 'ArrowDown':
    case 'ArrowRight':
      return 'next';
    case 'Home':
      return 'first';
    case 'End':
      return 'last';
    default:
      return null;
  }
}

/**
 * Compute the next focused index for a roving-tabindex list.
 *
 * @param current  current focused index (may be -1 when nothing focused yet)
 * @param count    total focusable item count
 * @param intent   navigation intent
 * @param wrap     when true, prev/next wrap around the ends (default false:
 *                 clamp at the ends)
 * @returns the next index clamped to [0, count - 1], or -1 when count <= 0.
 */
export function nextRovingIndex(
  current: number,
  count: number,
  intent: RovingKey,
  wrap = false,
): number {
  if (count <= 0) return -1;
  const last = count - 1;
  const cur = current < 0 ? 0 : Math.min(current, last);
  switch (intent) {
    case 'first':
      return 0;
    case 'last':
      return last;
    case 'prev':
      if (cur <= 0) return wrap ? last : 0;
      return cur - 1;
    case 'next':
      if (cur >= last) return wrap ? 0 : last;
      return cur + 1;
    default:
      return cur;
  }
}
