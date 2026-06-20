/**
 * createConfigProvider helpers — framework-agnostic config merge logic.
 * Pure functions only: shallow-merge a child config over a parent so that
 * `undefined` fields inherit from the parent (nearest-wins). The svelte layer
 * owns context injection. See specs/components/other/ConfigProvider.spec.md §3.
 */

/**
 * 主题：'auto' 跟随系统 prefers-color-scheme 自动在 light/dark 间切换。
 * 'light' | 'dark' 行为完全不变（向后兼容）。
 */
export type ConfigTheme = 'light' | 'dark' | 'auto';
/** 实际落到 DOM 的主题（auto 解析后只会是这两者之一）。 */
export type AppliedTheme = 'light' | 'dark';
export type ConfigDir = 'ltr' | 'rtl';
export type ConfigSize = 'small' | 'default' | 'large';
/**
 * 降级动画开关：true 强制降级、false 强制开启、'auto' 跟随系统
 * prefers-reduced-motion。
 */
export type ReducedMotionInput = boolean | 'auto';

/** A partial config as passed to a ConfigProvider (undefined = inherit). */
export interface ConfigInput {
  theme?: ConfigTheme;
  dir?: ConfigDir;
  size?: ConfigSize;
  zIndexBase?: number;
  transition?: boolean;
  reducedMotion?: ReducedMotionInput;
}

/** A fully-resolved config (every field present). */
export interface ResolvedConfig {
  theme: ConfigTheme;
  dir: ConfigDir;
  size: ConfigSize;
  zIndexBase: number;
  transition: boolean;
  reducedMotion: ReducedMotionInput;
}

export const DEFAULT_CONFIG: ResolvedConfig = {
  theme: 'light',
  dir: 'ltr',
  size: 'default',
  zIndexBase: 1000,
  transition: true,
  reducedMotion: 'auto',
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
    reducedMotion: child.reducedMotion ?? parent.reducedMotion,
  };
}

/**
 * 把配置主题解析为实际落到 DOM 的主题：'auto' 时跟随系统是否偏好暗色，
 * 其余原样返回。纯函数（红线 #2），不读 window，系统态由调用方注入。
 */
export function resolveAppliedTheme(theme: ConfigTheme, systemPrefersDark: boolean): AppliedTheme {
  if (theme === 'auto') return systemPrefersDark ? 'dark' : 'light';
  return theme;
}

/**
 * 解析最终是否降级动画：显式 boolean 优先，'auto' 跟随系统
 * prefers-reduced-motion。纯函数（红线 #2），系统态由调用方注入。
 * 返回 true 表示应降级（reduce）。
 */
export function resolveReducedMotion(input: ReducedMotionInput, systemReduced: boolean): boolean {
  if (typeof input === 'boolean') return input;
  return systemReduced;
}
