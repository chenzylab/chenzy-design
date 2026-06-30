/**
 * Alias / Semantic tokens. Express intent, bind to Global palette.
 * Dark mode ONLY remaps this layer. Components consume these (or Component tokens).
 *
 * Values follow Semi Design semantics (100% Semi color parity). Semi text colors
 * are grey-9 / grey-0 with opacity steps; we encode those as rgba literals.
 * Tradeoff: Semi status fills (success/warning/danger) carry white text and do
 * NOT clear WCAG AA — accepted to match Semi exactly (see contrast-check.ts).
 */
import { palette } from '../global/color.js';

/** light theme semantic mapping */
export const aliasLight = {
  // brand
  'color-primary': palette['blue-5'],
  'color-primary-hover': palette['blue-6'],
  'color-primary-active': palette['blue-7'],
  // 浅蓝（选中态背景，对齐 Semi primary-light-default）：被 Menu/Table/Tree/Calendar/Banner 选中态引用
  'color-primary-light-default': palette['blue-0'],
  // status (Semi: success=green-5, warning=orange-5, danger=red-5)
  'color-success': palette['green-5'],
  'color-warning': palette['orange-5'],
  'color-danger': palette['red-5'],
  'color-info': palette['blue-5'],
  'color-link': palette['blue-5'],
  // neutral semantic（secondary/tertiary type 的语义色，与 Button --btn-hue 同源）：
  // secondary=强中性（深灰），tertiary=弱中性（更浅灰）
  'color-secondary': palette['grey-9'],
  'color-tertiary': 'rgba(28, 31, 35, 0.62)',
  // text — Semi uses grey-9 with opacity: 100% / 80% / 62% / 35%
  'color-text-0': palette['grey-9'],
  'color-text-1': 'rgba(28, 31, 35, 0.8)',
  'color-text-2': 'rgba(28, 31, 35, 0.62)',
  'color-text-3': 'rgba(28, 31, 35, 0.35)',
  'color-text-inverse': '#ffffff',
  // background — 对齐 Semi：浅色 4 层背景全为纯白，层级靠 border/fill 半透明叠加 + 阴影区分
  'color-bg-0': '#ffffff',
  'color-bg-1': '#ffffff',
  'color-bg-2': '#ffffff',
  'color-bg-3': '#ffffff',
  // border / fill — 对齐 Semi：border=rgba(grey-9,.08)，fill=rgba(grey-8,.05/.09/.13)
  'color-border': 'rgba(28, 31, 35, 0.08)',
  'color-fill-0': 'rgba(46, 50, 56, 0.05)',
  'color-fill-1': 'rgba(46, 50, 56, 0.09)',
  'color-fill-2': 'rgba(46, 50, 56, 0.13)',
  // focus
  'color-focus': palette['blue-5'],
  'focus-ring': `0 0 0 2px ${palette['blue-2']}`,
} as const;

export type AliasKey = keyof typeof aliasLight;

/** dark theme: remap a subset; unspecified keys inherit light */
export const aliasDark: Partial<Record<AliasKey, string>> = {
  // text — Semi dark uses grey-0 (#f9f9f9) with opacity
  'color-text-0': '#f9f9f9',
  'color-text-1': 'rgba(249, 249, 249, 0.8)',
  'color-text-2': 'rgba(249, 249, 249, 0.6)',
  'color-text-3': 'rgba(249, 249, 249, 0.35)',
  'color-text-inverse': '#ffffff',
  // brand / status — Semi dark brightens these for visibility on dark surfaces
  'color-primary': '#54a9ff',
  'color-primary-hover': '#3295fb',
  'color-primary-active': '#65b2fc',
  // 暗色浅蓝选中背景：用低透明度品牌蓝在深色面上做轻提亮（对齐 Semi 暗色 primary-light）
  'color-primary-light-default': 'rgba(84, 169, 255, 0.2)',
  'color-info': '#54a9ff',
  'color-link': '#54a9ff',
  'color-success': '#5dc264',
  'color-warning': '#ffae43',
  'color-danger': '#fc725a',
  // neutral semantic（暗色：用亮灰阶，对齐 dark text-0 / text-2）
  'color-secondary': '#f9f9f9',
  'color-tertiary': 'rgba(249, 249, 249, 0.6)',
  // surfaces — 对齐 Semi 暗色 bg/border/fill
  'color-bg-0': '#16161a',
  'color-bg-1': '#232429',
  'color-bg-2': '#35363c',
  'color-bg-3': '#43444a',
  'color-border': 'rgba(255, 255, 255, 0.08)',
  'color-fill-0': 'rgba(255, 255, 255, 0.12)',
  'color-fill-1': 'rgba(255, 255, 255, 0.16)',
  'color-fill-2': 'rgba(255, 255, 255, 0.2)',
};
