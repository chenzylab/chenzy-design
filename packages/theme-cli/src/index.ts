/**
 * @chenzy-design/theme-cli — 公共 API。
 * 主要供 theme.config.ts 引入 defineTheme；也导出校验/生成工具供程序化使用。
 */
export { defineTheme, type ThemeConfig } from './config.js';
export {
  validateConfig,
  generateCss,
  type ValidationResult,
  type ValidationIssue,
} from './build.js';
