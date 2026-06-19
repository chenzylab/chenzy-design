/**
 * createConfigProvider helpers — framework-agnostic config merge logic.
 * Pure functions only: shallow-merge a child config over a parent so that
 * `undefined` fields inherit from the parent (nearest-wins). The svelte layer
 * owns context injection. See specs/components/other/ConfigProvider.spec.md §3.
 */

export type ConfigTheme = 'light' | 'dark';
export type ConfigDir = 'ltr' | 'rtl';
export type ConfigSize = 'small' | 'default' | 'large';

/** A partial config as passed to a ConfigProvider (undefined = inherit). */
export interface ConfigInput {
  theme?: ConfigTheme;
  dir?: ConfigDir;
  size?: ConfigSize;
  zIndexBase?: number;
  transition?: boolean;
}

/** A fully-resolved config (every field present). */
export interface ResolvedConfig {
  theme: ConfigTheme;
  dir: ConfigDir;
  size: ConfigSize;
  zIndexBase: number;
  transition: boolean;
}

export const DEFAULT_CONFIG: ResolvedConfig = {
  theme: 'light',
  dir: 'ltr',
  size: 'default',
  zIndexBase: 1000,
  transition: true,
};

/**
 * Shallow-merge a child config over a resolved parent: each field of `child`
 * overrides the parent only when explicitly provided (not undefined), so
 * omitting a field inherits the parent's value.
 */
export function mergeConfig(parent: ResolvedConfig, child: ConfigInput): ResolvedConfig {
  return {
    theme: child.theme ?? parent.theme,
    dir: child.dir ?? parent.dir,
    size: child.size ?? parent.size,
    zIndexBase: child.zIndexBase ?? parent.zIndexBase,
    transition: child.transition ?? parent.transition,
  };
}
