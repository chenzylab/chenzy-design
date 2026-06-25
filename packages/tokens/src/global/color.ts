/**
 * Global color palette — raw atomic values, no semantics.
 * Component code must NEVER reference these directly; consume Alias tokens instead.
 * See specs/00-foundation/tokens.spec.md.
 *
 * Values are the real Semi Design palette (0 lightest → 9 darkest), captured
 * from the Semi Design reference. The library targets 100% Semi color parity;
 * note grey-0 is #f9f9f9 (not pure white) per Semi.
 */
export const palette = {
  // Neutral / grey scale (0 lightest → 9 darkest)
  'grey-0': '#f9f9f9',
  'grey-1': '#e6e8ea',
  'grey-2': '#c6cacd',
  'grey-3': '#a7abb0',
  'grey-4': '#888d92',
  'grey-5': '#6b7075',
  'grey-6': '#555b61',
  'grey-7': '#41464c',
  'grey-8': '#2e3238',
  'grey-9': '#1c1f23',
  // Brand blue
  'blue-0': '#eaf5ff',
  'blue-1': '#cbe7fe',
  'blue-2': '#98cdfd',
  'blue-3': '#65b2fc',
  'blue-4': '#3295fb',
  'blue-5': '#0064fa',
  'blue-6': '#0062d6',
  'blue-7': '#004fb3',
  'blue-8': '#003d8f',
  'blue-9': '#002c6b',
  // Green (success)
  'green-0': '#ecf7ec',
  'green-1': '#d0f0d1',
  'green-2': '#a4e0a7',
  'green-3': '#7dd182',
  'green-4': '#5ac262',
  'green-5': '#3bb346',
  'green-6': '#30953b',
  'green-7': '#25772f',
  'green-8': '#1b5924',
  'green-9': '#113c18',
  // Red (danger)
  'red-0': '#fef2ed',
  'red-1': '#feddd2',
  'red-2': '#fdb7a5',
  'red-3': '#fb9078',
  'red-4': '#fa664c',
  'red-5': '#f93920',
  'red-6': '#d52515',
  'red-7': '#b2140c',
  'red-8': '#8e0805',
  'red-9': '#6a0103',
  // Orange (warning) — Semi's warning ramp is orange, not yellow
  'orange-0': '#fff8ea',
  'orange-1': '#feeecc',
  'orange-2': '#fed998',
  'orange-3': '#fdc165',
  'orange-4': '#fda633',
  'orange-5': '#fc8800',
  'orange-6': '#d26700',
  'orange-7': '#a84a00',
  'orange-8': '#7e3100',
  'orange-9': '#541d00',
} as const;

export type GlobalColorKey = keyof typeof palette;
