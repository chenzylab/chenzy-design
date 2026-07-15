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

/**
 * light theme semantic mapping — 1:1 对齐 Semi global.scss（semi-theme-default）。
 * 状态色四档：base / hover / active / disabled + 浅版 light-default/hover/active。
 * 未纳入（无组件消费，避免膨胀）：data-*（vchart）、highlight、default-*。
 */
export const aliasLight = {
  // —— primary（主要，blue）——
  'color-primary': palette['blue-5'],
  'color-primary-hover': palette['blue-6'],
  'color-primary-active': palette['blue-7'],
  'color-primary-disabled': palette['blue-2'],
  'color-primary-light-default': palette['blue-0'],
  'color-primary-light-hover': palette['blue-1'],
  'color-primary-light-active': palette['blue-2'],
  // —— secondary（次要，Semi = light-blue 青蓝）——
  'color-secondary': '#0095ee', // light-blue-5
  'color-secondary-hover': '#007bca', // light-blue-6
  'color-secondary-active': '#0063a7', // light-blue-7
  'color-secondary-disabled': '#95d8f8', // light-blue-2
  'color-secondary-light-default': '#e9f7fd', // light-blue-0
  'color-secondary-light-hover': '#c9ecfc', // light-blue-1
  'color-secondary-light-active': '#95d8f8', // light-blue-2
  // —— tertiary（第三，grey）——
  'color-tertiary': palette['grey-5'],
  'color-tertiary-hover': palette['grey-6'],
  'color-tertiary-active': palette['grey-7'],
  'color-tertiary-light-default': palette['grey-0'],
  'color-tertiary-light-hover': palette['grey-1'],
  'color-tertiary-light-active': palette['grey-2'],
  // —— info（信息，blue）——
  'color-info': palette['blue-5'],
  'color-info-hover': palette['blue-6'],
  'color-info-active': palette['blue-7'],
  'color-info-disabled': palette['blue-2'],
  'color-info-light-default': palette['blue-0'],
  'color-info-light-hover': palette['blue-1'],
  'color-info-light-active': palette['blue-2'],
  // —— success（成功，green）——
  'color-success': palette['green-5'],
  'color-success-hover': palette['green-6'],
  'color-success-active': palette['green-7'],
  'color-success-disabled': palette['green-2'],
  'color-success-light-default': palette['green-0'],
  'color-success-light-hover': palette['green-1'],
  'color-success-light-active': palette['green-2'],
  // —— warning（警示，orange）——
  'color-warning': palette['orange-5'],
  'color-warning-hover': palette['orange-6'],
  'color-warning-active': palette['orange-7'],
  // 镜像 Semi $color-rating-icon-default（评分已填星色）= yellow-5
  'color-rating-icon-default': palette['yellow-5'],
  // 镜像 Semi $color-highlight / $color-highlight-bg（文本搜索高亮）：亮色 black 字 + yellow-4 底
  'color-highlight': '#000000',
  'color-highlight-bg': palette['yellow-4'],
  'color-warning-disabled': palette['orange-2'],
  'color-warning-light-default': palette['orange-0'],
  'color-warning-light-hover': palette['orange-1'],
  'color-warning-light-active': palette['orange-2'],
  // —— danger（危险，red）——
  'color-danger': palette['red-5'],
  'color-danger-hover': palette['red-6'],
  'color-danger-active': palette['red-7'],
  'color-danger-disabled': palette['red-2'],
  'color-danger-light-default': palette['red-0'],
  'color-danger-light-hover': palette['red-1'],
  'color-danger-light-active': palette['red-2'],
  // —— link（链接，blue）——
  'color-link': palette['blue-5'],
  'color-link-hover': palette['blue-6'],
  'color-link-active': palette['blue-7'],
  'color-link-visited': palette['blue-5'],
  // —— disabled（禁用态）——
  'color-disabled-text': 'rgba(28, 31, 35, 0.35)',
  'color-disabled-border': palette['grey-1'],
  'color-disabled-bg': palette['grey-1'],
  'color-disabled-fill': 'rgba(46, 50, 56, 0.04)',
  // text — Semi grey-9 + 不透明度 100/80/62/35
  'color-text-0': palette['grey-9'],
  'color-text-1': 'rgba(28, 31, 35, 0.8)',
  'color-text-2': 'rgba(28, 31, 35, 0.62)',
  'color-text-3': 'rgba(28, 31, 35, 0.35)',
  // background — Semi 浅色 5 层全白，层级靠 border/fill 半透明 + 阴影
  'color-bg-0': '#ffffff',
  'color-bg-1': '#ffffff',
  'color-bg-2': '#ffffff',
  'color-bg-3': '#ffffff',
  'color-bg-4': '#ffffff',
  'color-nav-bg': '#ffffff',
  'color-bg-inverse': palette['grey-9'],
  'color-overlay-bg': 'rgba(22, 22, 26, 0.6)',
  // 内容遮罩：盖在内容/媒体上、hover 显露操作的深色轻遮罩（Avatar hover、图片操作蒙层等）。
  // 比 overlay-bg（Modal 背景 0.6）更轻，语义为「就地遮罩」而非「全屏背景」。
  'color-mask': 'rgba(0, 0, 0, 0.4)',
  // border / fill / shadow — 对齐 Semi
  'color-border': 'rgba(28, 31, 35, 0.08)',
  'color-fill-0': 'rgba(46, 50, 56, 0.05)',
  'color-fill-1': 'rgba(46, 50, 56, 0.09)',
  'color-fill-2': 'rgba(46, 50, 56, 0.13)',
  'color-shadow': 'rgba(0, 0, 0, 0.04)',
  // focus
  'color-focus': palette['blue-5'],
  'color-focus-border': palette['blue-5'],
  'focus-ring': `0 0 0 2px ${palette['blue-2']}`,
  // —— AI general 渐变（对齐 Semi general-5/6/7，FloatButton colorful 消费）——
  'color-ai-general':
    'linear-gradient(278deg, rgb(233,69,255) 0%, rgb(166,71,255) 30%, rgb(107,97,255) 60%, rgb(46,140,255) 100%)',
  'color-ai-general-hover':
    'linear-gradient(278deg, rgb(194,53,219) 0%, rgb(134,54,219) 30%, rgb(88,77,219) 60%, rgb(33,114,219) 100%)',
  'color-ai-general-active':
    'linear-gradient(278deg, rgb(157,39,184) 0%, rgb(105,40,184) 30%, rgb(71,59,184) 60%, rgb(22,89,184) 100%)',
} as const;

export type AliasKey = keyof typeof aliasLight;

/**
 * dark theme — 1:1 对齐 Semi 暗色（palette 在暗色下整体反转：blue-5=84,169,255 …）。
 * 未指定的键继承 light。状态浅版在暗色用 rgba(主色, .2/.3/.4)。
 */
export const aliasDark: Partial<Record<AliasKey, string>> = {
  // text — Semi 暗色 grey-9=#f9f9f9 + 不透明度
  'color-text-0': '#f9f9f9',
  'color-text-1': 'rgba(249, 249, 249, 0.8)',
  'color-text-2': 'rgba(249, 249, 249, 0.62)',
  'color-text-3': 'rgba(249, 249, 249, 0.35)',
  // Rating 星色 — Semi 暗色 yellow-5 = rgb(253,222,67)
  'color-rating-icon-default': '#fdde43',
  // Highlight — Semi 暗色 white 字 + yellow-2 底（yellow-2 = #fdf398）
  'color-highlight': '#ffffff',
  'color-highlight-bg': '#fdf398',
  // —— primary（暗色 blue 反转）——
  'color-primary': 'rgb(84, 169, 255)', // blue-5
  'color-primary-hover': 'rgb(127, 193, 255)', // blue-6
  'color-primary-active': 'rgb(169, 215, 255)', // blue-7
  'color-primary-disabled': 'rgb(19, 92, 184)', // blue-2
  'color-primary-light-default': 'rgba(84, 169, 255, 0.2)',
  'color-primary-light-hover': 'rgba(84, 169, 255, 0.3)',
  'color-primary-light-active': 'rgba(84, 169, 255, 0.4)',
  // —— secondary（暗色 light-blue）——
  'color-secondary': 'rgb(72, 179, 245)',
  'color-secondary-hover': 'rgb(120, 199, 247)',
  'color-secondary-active': 'rgb(168, 219, 250)',
  'color-secondary-disabled': 'rgb(3, 102, 169)',
  'color-secondary-light-default': 'rgba(72, 179, 245, 0.2)',
  'color-secondary-light-hover': 'rgba(72, 179, 245, 0.3)',
  'color-secondary-light-active': 'rgba(72, 179, 245, 0.4)',
  // —— tertiary（暗色 grey 反转）——
  'color-tertiary': 'rgb(136, 141, 146)', // grey-5
  'color-tertiary-hover': 'rgb(167, 171, 176)', // grey-6
  'color-tertiary-active': 'rgb(198, 202, 205)', // grey-7
  'color-tertiary-light-default': 'rgb(28, 31, 35)', // grey-0
  'color-tertiary-light-hover': 'rgb(46, 50, 56)', // grey-1
  'color-tertiary-light-active': 'rgb(65, 70, 76)', // grey-2
  // —— info / success / warning / danger（暗色主色反转 + 浅版半透明）——
  'color-info': 'rgb(84, 169, 255)',
  'color-info-hover': 'rgb(127, 193, 255)',
  'color-info-active': 'rgb(169, 215, 255)',
  'color-info-disabled': 'rgb(19, 92, 184)',
  'color-info-light-default': 'rgba(84, 169, 255, 0.2)',
  'color-info-light-hover': 'rgba(84, 169, 255, 0.3)',
  'color-info-light-active': 'rgba(84, 169, 255, 0.4)',
  'color-success': 'rgb(93, 194, 100)',
  'color-success-hover': 'rgb(127, 209, 132)',
  'color-success-active': 'rgb(166, 225, 168)',
  'color-success-disabled': 'rgb(39, 119, 49)',
  'color-success-light-default': 'rgba(93, 194, 100, 0.2)',
  'color-success-light-hover': 'rgba(93, 194, 100, 0.3)',
  'color-success-light-active': 'rgba(93, 194, 100, 0.4)',
  'color-warning': 'rgb(255, 174, 67)',
  'color-warning-hover': 'rgb(255, 199, 114)',
  'color-warning-active': 'rgb(255, 221, 161)',
  'color-warning-disabled': 'rgb(170, 80, 10)',
  'color-warning-light-default': 'rgba(255, 174, 67, 0.2)',
  'color-warning-light-hover': 'rgba(255, 174, 67, 0.3)',
  'color-warning-light-active': 'rgba(255, 174, 67, 0.4)',
  'color-danger': 'rgb(252, 114, 90)',
  'color-danger-hover': 'rgb(253, 153, 131)',
  'color-danger-active': 'rgb(253, 190, 172)',
  'color-danger-disabled': 'rgb(180, 32, 25)',
  'color-danger-light-default': 'rgba(252, 114, 90, 0.2)',
  'color-danger-light-hover': 'rgba(252, 114, 90, 0.3)',
  'color-danger-light-active': 'rgba(252, 114, 90, 0.4)',
  // —— link ——
  'color-link': 'rgb(84, 169, 255)',
  'color-link-hover': 'rgb(127, 193, 255)',
  'color-link-active': 'rgb(169, 215, 255)',
  'color-link-visited': 'rgb(84, 169, 255)',
  // —— disabled ——
  'color-disabled-text': 'rgba(249, 249, 249, 0.35)',
  'color-disabled-border': 'rgb(46, 50, 56)', // dark grey-1
  'color-disabled-bg': 'rgb(46, 50, 56)',
  'color-disabled-fill': 'rgba(230, 232, 234, 0.04)', // dark grey-8
  // surfaces — Semi 暗色 bg/border/fill
  'color-bg-0': '#16161a',
  'color-bg-1': '#232429',
  'color-bg-2': '#35363c',
  'color-bg-3': '#43444a',
  'color-bg-4': '#4a4d56',
  'color-nav-bg': '#232429',
  'color-bg-inverse': '#f9f9f9',
  'color-overlay-bg': 'rgba(22, 22, 26, 0.6)',
  // 内容遮罩暗色同值：语义即压暗内容显露操作，亮暗一致（对齐 overlay-bg 做法）。
  'color-mask': 'rgba(0, 0, 0, 0.4)',
  'color-border': 'rgba(255, 255, 255, 0.08)',
  'color-fill-0': 'rgba(255, 255, 255, 0.12)',
  'color-fill-1': 'rgba(255, 255, 255, 0.16)',
  'color-fill-2': 'rgba(255, 255, 255, 0.2)',
  'color-shadow': 'rgba(0, 0, 0, 0.04)',
  // focus
  'color-focus': 'rgb(84, 169, 255)',
  'color-focus-border': 'rgb(84, 169, 255)',
  // —— AI general 渐变（Semi 暗色 general-5/6/7；-0 浅蓝→-3 粉，与 light 顺序相反，已按 278deg 从 -0 到 -3 排好）——
  'color-ai-general':
    'linear-gradient(278deg, rgb(234,107,246) 0%, rgb(195,117,255) 30%, rgb(134,129,252) 60%, rgb(91,162,245) 100%)',
  'color-ai-general-hover':
    'linear-gradient(278deg, rgb(243,143,248) 0%, rgb(213,152,255) 30%, rgb(163,160,253) 60%, rgb(131,187,248) 100%)',
  'color-ai-general-active':
    'linear-gradient(278deg, rgb(249,180,251) 0%, rgb(229,186,255) 30%, rgb(192,192,253) 60%, rgb(172,210,250) 100%)',
};
