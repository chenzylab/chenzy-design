/**
 * Alias / Semantic tokens. Express intent, bind to Global palette.
 * Dark mode ONLY remaps this layer. Components consume these (or Component tokens).
 */
import { palette } from '../global/color.js';

/** light theme semantic mapping */
export const aliasLight = {
  // brand
  'color-primary': palette['blue-5'],
  'color-primary-hover': palette['blue-6'],
  'color-primary-active': palette['blue-7'],
  // status
  'color-success': palette['green-5'],
  'color-warning': palette['yellow-5'],
  'color-danger': palette['red-5'],
  'color-info': palette['blue-5'],
  // text (0 strongest → 3 weakest)
  'color-text-0': palette['grey-9'],
  'color-text-1': palette['grey-8'],
  'color-text-2': palette['grey-6'],
  'color-text-3': palette['grey-5'],
  'color-text-inverse': palette['grey-0'],
  // background (0 base → higher elevations)
  'color-bg-0': palette['grey-0'],
  'color-bg-1': palette['grey-1'],
  'color-bg-2': palette['grey-2'],
  'color-bg-3': palette['grey-3'],
  // border / fill
  'color-border': palette['grey-3'],
  'color-fill-0': palette['grey-1'],
  'color-fill-1': palette['grey-2'],
  // focus
  'color-focus': palette['blue-5'],
  'focus-ring': `0 0 0 2px ${palette['blue-2']}`,
} as const;

export type AliasKey = keyof typeof aliasLight;

/** dark theme: remap a subset; unspecified keys inherit light */
export const aliasDark: Partial<Record<AliasKey, string>> = {
  'color-text-0': palette['grey-1'],
  'color-text-1': palette['grey-3'],
  'color-text-2': palette['grey-5'],
  'color-text-3': palette['grey-6'],
  'color-text-inverse': palette['grey-9'],
  'color-bg-0': '#16161a',
  'color-bg-1': '#1d1d22',
  'color-bg-2': '#26262c',
  'color-bg-3': '#303038',
  'color-border': '#3a3a42',
  'color-fill-0': '#1d1d22',
  'color-fill-1': '#26262c',
};
