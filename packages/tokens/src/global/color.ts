/**
 * Global color palette — raw atomic values, no semantics.
 * Component code must NEVER reference these directly; consume Alias tokens instead.
 * See specs/00-foundation/tokens.spec.md.
 */
export const palette = {
  // Neutral / grey scale (0 lightest → 9 darkest)
  'grey-0': '#ffffff',
  'grey-1': '#f7f8fa',
  'grey-2': '#eff0f1',
  'grey-3': '#e4e6eb',
  'grey-4': '#c9cdd4',
  'grey-5': '#a9aeb8',
  'grey-6': '#8a9099',
  'grey-7': '#6b7280',
  'grey-8': '#4e5969',
  'grey-9': '#1d2129',
  // Brand blue
  'blue-1': '#e8f3ff',
  'blue-2': '#b8d9ff',
  'blue-3': '#7eb8ff',
  'blue-4': '#4a93ff',
  'blue-5': '#0066ff',
  'blue-6': '#0052cc',
  'blue-7': '#003e99',
  // Green (success)
  'green-5': '#16a34a',
  'green-6': '#15803d',
  // Yellow (warning)
  'yellow-5': '#f59e0b',
  'yellow-6': '#d97706',
  // Red (danger) — red-4 is a light tint for dark-mode solid surfaces (dark text needs a brighter danger bg to reach AA)
  'red-4': '#ff7875',
  'red-5': '#ef4444',
  'red-6': '#dc2626',
} as const;

export type GlobalColorKey = keyof typeof palette;
