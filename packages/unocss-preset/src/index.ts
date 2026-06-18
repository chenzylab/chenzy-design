/**
 * @chenzy-design/unocss-preset
 * Exposes Design Tokens as a UnoCSS theme + injects tokens.css.
 * See specs/00-foundation/theming.spec.md.
 */
import type { Preset, PresetUnoTheme as Theme } from 'unocss';
import { theme } from '@chenzy-design/tokens/uno-theme';

export interface PresetOptions {
  /**
   * Inject tokens.css via preflight (default false).
   * Prefer importing '@chenzy-design/tokens/tokens.css' in your app entry —
   * preflight injection lands after resets and trips the "@import must precede"
   * CSS rule. Kept as an opt-in escape hatch.
   */
  injectTokens?: boolean;
}

export function presetChenzy(options: PresetOptions = {}): Preset<Theme> {
  const { injectTokens = false } = options;
  return {
    name: '@chenzy-design/unocss-preset',
    theme: theme as Theme,
    preflights: injectTokens
      ? [{ getCSS: () => `@import '@chenzy-design/tokens/tokens.css';` }]
      : [],
  };
}

export default presetChenzy;
