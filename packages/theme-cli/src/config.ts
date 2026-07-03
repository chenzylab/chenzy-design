/**
 * 主题配置类型与 defineTheme 辅助。
 * 见 specs/00-foundation/theming.spec.md「theme-cli 接口（草案）」。
 */

export interface ThemeConfig {
  /**
   * Alias / 全局语义 token 覆写。key 为无 `--cd-` 前缀的 token 名，
   * 如 `{ 'color-primary': '#0066ff' }`。落到产物的 `:root{}` 段。
   */
  alias?: Record<string, string>;
  /**
   * 暗色覆写，如 `{ 'color-bg-0': '#16161a' }`。
   * 落到产物的 `[data-theme="dark"]{}` 段。
   */
  dark?: Record<string, string>;
}

/** 类型化配置辅助：原样透传，仅用于让 theme.config.ts 获得类型提示。 */
export function defineTheme(config: ThemeConfig): ThemeConfig {
  return config;
}
