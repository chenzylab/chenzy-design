/**
 * Alias / Semantic tokens. Express intent, bind to Global palette.
 * Dark mode ONLY remaps this layer. Components consume these (or Component tokens).
 *
 * Values follow Semi Design semantics (100% Semi color parity). Semi text colors
 * are grey-9 / grey-0 with opacity steps; we encode those as rgba literals.
 * Tradeoff: Semi status fills (success/warning/danger) carry white text and do
 * NOT clear WCAG AA — accepted to match Semi exactly (see contrast-check.ts).
 */
import { palette, ref, type TokenRef } from '../global/color.js';

/**
 * light theme semantic mapping — 1:1 对齐 Semi global.scss（semi-theme-default）。
 * 状态色四档：base / hover / active / disabled + 浅版 light-default/hover/active。
 *
 * ⚠️ **指向色板的条目必须用 `ref('x')`，不能写 `palette['x']` 或抄字面值。**
 * 前者构建出 `var(--cd-color-x)`（与 Semi 的 `rgba(var(--semi-x), 1)` 同构，
 * 覆盖色板即换肤）；后者在编译期就被取值展开，语义层与色板层的联动会**静默断掉**。
 * 详见 `ref()` 的文档注释（内含双侧实测证据）。
 */
export const aliasLight = {
  // —— primary（主要，blue）——
  'color-primary': ref('blue-5'),
  'color-primary-hover': ref('blue-6'),
  'color-primary-active': ref('blue-7'),
  'color-primary-disabled': ref('blue-2'),
  'color-primary-light-default': ref('blue-0'),
  'color-primary-light-hover': ref('blue-1'),
  'color-primary-light-active': ref('blue-2'),
  // —— secondary（次要，Semi = light-blue 青蓝）——
  'color-secondary': ref('light-blue-5'),
  'color-secondary-hover': ref('light-blue-6'),
  'color-secondary-active': ref('light-blue-7'),
  'color-secondary-disabled': ref('light-blue-2'),
  'color-secondary-light-default': ref('light-blue-0'),
  'color-secondary-light-hover': ref('light-blue-1'),
  'color-secondary-light-active': ref('light-blue-2'),
  // —— tertiary（第三，grey）——
  'color-tertiary': ref('grey-5'),
  'color-tertiary-hover': ref('grey-6'),
  'color-tertiary-active': ref('grey-7'),
  'color-tertiary-light-default': ref('grey-0'),
  'color-tertiary-light-hover': ref('grey-1'),
  'color-tertiary-light-active': ref('grey-2'),
  // —— info（信息，blue）——
  'color-info': ref('blue-5'),
  'color-info-hover': ref('blue-6'),
  'color-info-active': ref('blue-7'),
  'color-info-disabled': ref('blue-2'),
  'color-info-light-default': ref('blue-0'),
  'color-info-light-hover': ref('blue-1'),
  'color-info-light-active': ref('blue-2'),
  // —— success（成功，green）——
  'color-success': ref('green-5'),
  'color-success-hover': ref('green-6'),
  'color-success-active': ref('green-7'),
  'color-success-disabled': ref('green-2'),
  'color-success-light-default': ref('green-0'),
  'color-success-light-hover': ref('green-1'),
  'color-success-light-active': ref('green-2'),
  // —— warning（警示，orange）——
  'color-warning': ref('orange-5'),
  'color-warning-hover': ref('orange-6'),
  'color-warning-active': ref('orange-7'),
  // 镜像 Semi $color-rating-icon-default（评分已填星色）= yellow-5
  'color-rating-icon-default': ref('yellow-5'),
  // 镜像 Semi $color-highlight / $color-highlight-bg（文本搜索高亮）：亮色 black 字 + yellow-4 底
  'color-highlight': ref('black'),
  'color-highlight-bg': ref('yellow-4'),
  'color-warning-disabled': ref('orange-2'),
  'color-warning-light-default': ref('orange-0'),
  'color-warning-light-hover': ref('orange-1'),
  'color-warning-light-active': ref('orange-2'),
  // —— danger（危险，red）——
  'color-danger': ref('red-5'),
  'color-danger-hover': ref('red-6'),
  'color-danger-active': ref('red-7'),
  'color-danger-disabled': ref('red-2'),
  'color-danger-light-default': ref('red-0'),
  'color-danger-light-hover': ref('red-1'),
  'color-danger-light-active': ref('red-2'),
  // —— link（链接，blue）——
  'color-link': ref('blue-5'),
  'color-link-hover': ref('blue-6'),
  'color-link-active': ref('blue-7'),
  'color-link-visited': ref('blue-5'),
  // —— disabled（禁用态）——
  // Semi 是 rgba(var(--semi-grey-9), .35)：**在色板之上叠透明度**，故本库用 color-mix
  // 复合同一个色板变量（沿用 tag.ts / chat.ts 既有惯例），而不是把合成结果抄成字面值。
  'color-disabled-text': 'color-mix(in srgb, var(--cd-color-grey-9) 35%, transparent)',
  'color-disabled-border': ref('grey-1'),
  'color-disabled-bg': ref('grey-1'),
  'color-disabled-fill': 'color-mix(in srgb, var(--cd-color-grey-8) 4%, transparent)',
  // text — Semi grey-9 + 不透明度 100/80/62/35
  'color-text-0': ref('grey-9'),
  'color-text-1': 'color-mix(in srgb, var(--cd-color-grey-9) 80%, transparent)',
  'color-text-2': 'color-mix(in srgb, var(--cd-color-grey-9) 62%, transparent)',
  'color-text-3': 'color-mix(in srgb, var(--cd-color-grey-9) 35%, transparent)',
  // background — Semi 浅色 5 层全白（都指向 white 基元），层级靠 border/fill 半透明 + 阴影
  'color-bg-0': ref('white'),
  'color-bg-1': ref('white'),
  'color-bg-2': ref('white'),
  'color-bg-3': ref('white'),
  'color-bg-4': ref('white'),
  'color-nav-bg': ref('white'),
  'color-bg-inverse': ref('grey-9'),
  'color-overlay-bg': 'rgba(22, 22, 26, 0.6)',
  // 内容遮罩：盖在内容/媒体上、hover 显露操作的深色轻遮罩（Avatar hover、图片操作蒙层等）。
  // 比 overlay-bg（Modal 背景 0.6）更轻，语义为「就地遮罩」而非「全屏背景」。
  'color-mask': 'rgba(0, 0, 0, 0.4)',
  // border / fill / shadow — 对齐 Semi（同为色板 + 透明度复合）
  'color-border': 'color-mix(in srgb, var(--cd-color-grey-9) 8%, transparent)',
  'color-fill-0': 'color-mix(in srgb, var(--cd-color-grey-8) 5%, transparent)',
  'color-fill-1': 'color-mix(in srgb, var(--cd-color-grey-8) 9%, transparent)',
  'color-fill-2': 'color-mix(in srgb, var(--cd-color-grey-8) 13%, transparent)',
  'color-shadow': 'color-mix(in srgb, var(--cd-color-black) 4%, transparent)',
  // focus
  'color-focus': ref('blue-5'),
  'color-focus-border': ref('blue-5'),
  'focus-ring': `0 0 0 2px ${palette['blue-2']}`,
  // —— AI general 渐变：指向档位变量，与 Semi 同构（Semi 是 var(--semi-ai-general-5)）——
  'color-ai-general': 'var(--cd-color-ai-general-5)',
  'color-ai-general-hover': 'var(--cd-color-ai-general-6)',
  'color-ai-general-active': 'var(--cd-color-ai-general-7)',
  // 对齐 Semi $color-ai-general-disabled: var(--semi-ai-general-2)
  'color-ai-general-disabled': 'var(--cd-color-ai-general-2)',
  // AI general 浅底（Semi general-0）：Button tertiary solid colorful 的极浅淡彩背景
  'color-ai-general-light': 'var(--cd-color-ai-general-0)',
  // AI general 四色渐变分量（Semi iconButton getFillColor 默认值，逐值对应 ai-general-5-0..3）：
  // colorful 图标 multipleColor（4 色）fill 注入消费，与 color-ai-general 渐变背景同源档位。
  'color-ai-general-multiple-0': 'var(--cd-color-ai-general-5-0)',
  'color-ai-general-multiple-1': 'var(--cd-color-ai-general-5-1)',
  'color-ai-general-multiple-2': 'var(--cd-color-ai-general-5-2)',
  'color-ai-general-multiple-3': 'var(--cd-color-ai-general-5-3)',
  // AI general 双色 fill（Semi twoColor 默认值 ['rgba(166,71,255)', 'currentColor']）：
  // primary = ai-general-5-1，secondary 跟随文字颜色（非渐变，故用 currentColor 而非 token）。
  'color-ai-general-two-primary': 'var(--cd-color-ai-general-5-1)',
  // AI purple（Semi ai-purple-5）：Button primary outline colorful 的紫色文字/边框（单色，非渐变）
  'color-ai-purple': ref('ai-purple-5'),
  'color-ai-purple-hover': ref('ai-purple-6'),
  'color-ai-purple-active': ref('ai-purple-7'),
  'color-ai-purple-disabled': ref('ai-purple-2'),
  // —— 以下镜像 Semi global.scss 的运行时变量（此前本库整段缺失）——
  // vchart 数据色板 data-0..19：Semi 定义了本库却没有，图表类消费方无从取色。
  // color-default 三档：Semi 标注「不建议使用」但确实存在；本库多处组件 token
  // 曾用 fill-1/grey-0 近似（fill-* 是半透明叠加、default 是不透明灰，语义不同）。
  'color-default': ref('grey-0'),
  'color-default-hover': ref('grey-1'),
  'color-default-active': ref('grey-2'),
  'color-data-0': '#5769ff',
  'color-data-1': '#8ed4e7',
  'color-data-2': '#f58700',
  'color-data-3': '#dcb7fc',
  'color-data-4': '#4a9cf7',
  'color-data-5': '#f3cc35',
  'color-data-6': '#fe8090',
  'color-data-7': '#8bd7d2',
  'color-data-8': '#83b023',
  'color-data-9': '#e9a5e5',
  'color-data-10': '#30a7ce',
  'color-data-11': '#f9c064',
  'color-data-12': '#b171f9',
  'color-data-13': '#77b6f9',
  'color-data-14': '#c88f02',
  'color-data-15': '#ffaab2',
  'color-data-16': '#33b0ab',
  'color-data-17': '#b6d781',
  'color-data-18': '#d458d4',
  'color-data-19': '#bcc6ff',
  'color-ai-background-bottom': 'linear-gradient(201.15deg, rgba(255, 255, 255, 0.04) 6.58%, rgba(255, 226, 138, 0.04) 32.88%, rgba(231, 45, 255, 0.04) 67.93%, rgba(0, 115, 255, 0.04) 94.23%)',
  'color-ai-background-bottom-hover': 'linear-gradient(201.15deg, rgba(255, 255, 255, 0.08) 6.58%, rgba(255, 226, 138, 0.08) 32.88%, rgba(231, 45, 255, 0.08) 67.93%, rgba(0, 115, 255, 0.08) 94.23%)',
  'color-ai-background-bottom-active': 'linear-gradient(201.15deg, rgba(255, 255, 255, 0.12) 6.58%, rgba(255, 226, 138, 0.12) 32.88%, rgba(231, 45, 255, 0.12) 67.93%, rgba(0, 115, 255, 0.12) 94.23%)',
  'color-ai-background-top': 'linear-gradient(201.15deg, rgba(83, 56, 255, 0.16) 6.58%, rgba(176, 48, 240, 0.096) 32.88%, rgba(231, 45, 255, 0.048) 59.17%, rgba(255, 255, 255, 0) 94.23%)',
  'color-ai-background-top-hover': 'linear-gradient(201.15deg, rgba(83, 56, 255, 0.24) 6.58%, rgba(176, 48, 240, 0.144) 32.88%, rgba(231, 45, 255, 0.072) 59.17%, rgba(255, 255, 255, 0) 94.23%)',
  'color-ai-background-top-active': 'linear-gradient(201.15deg, rgba(83, 56, 255, 0.32) 6.58%, rgba(176, 48, 240, 0.192) 32.88%, rgba(231, 45, 255, 0.096) 59.17%, rgba(255, 255, 255, 0) 94.23%)',
} as const;

export type AliasKey = keyof typeof aliasLight;

/**
 * dark theme — 1:1 对齐 Semi 暗色（palette 在暗色下整体反转：blue-5=84,169,255 …）。
 * 未指定的键继承 light。状态浅版在暗色用 rgba(主色, .2/.3/.4)。
 */
export const aliasDark: Partial<Record<AliasKey, string | TokenRef>> = {
  // text — Semi 暗色 grey-9=#f9f9f9 + 不透明度
  'color-text-0': ref('grey-9'),
  'color-text-1': 'rgba(249, 249, 249, 0.8)',
  'color-text-2': 'rgba(249, 249, 249, 0.62)',
  'color-text-3': 'rgba(249, 249, 249, 0.35)',
  // Rating 星色 — Semi 暗色 yellow-5 = rgb(253,222,67)
  'color-rating-icon-default': ref('yellow-5'),
  // Highlight — Semi 暗色 white 字 + yellow-2 底（yellow-2 = #fdf398）
  'color-highlight': '#ffffff',
  'color-highlight-bg': '#fdf398',
  // —— primary（暗色 blue 反转）——
  'color-primary': ref('blue-5'),
  'color-primary-hover': ref('blue-6'),
  'color-primary-active': ref('blue-7'),
  'color-primary-disabled': ref('blue-2'),
  'color-primary-light-default': 'rgba(84, 169, 255, 0.2)',
  'color-primary-light-hover': 'rgba(84, 169, 255, 0.3)',
  'color-primary-light-active': 'rgba(84, 169, 255, 0.4)',
  // —— secondary（暗色 light-blue）——
  'color-secondary': 'rgb(72, 179, 245)',
  'color-secondary-hover': 'rgb(120, 199, 247)',
  'color-secondary-active': 'rgb(168, 219, 250)',
  'color-secondary-disabled': ref('light-blue-2'),
  'color-secondary-light-default': 'rgba(72, 179, 245, 0.2)',
  'color-secondary-light-hover': 'rgba(72, 179, 245, 0.3)',
  'color-secondary-light-active': 'rgba(72, 179, 245, 0.4)',
  // —— tertiary（暗色 grey 反转）——
  'color-tertiary': ref('grey-5'),
  'color-tertiary-hover': ref('grey-6'),
  'color-tertiary-active': ref('grey-7'),
  'color-tertiary-light-default': ref('grey-0'),
  'color-tertiary-light-hover': ref('grey-1'),
  'color-tertiary-light-active': ref('grey-2'),
  // —— info / success / warning / danger（暗色主色反转 + 浅版半透明）——
  'color-info': ref('blue-5'),
  'color-info-hover': ref('blue-6'),
  'color-info-active': ref('blue-7'),
  'color-info-disabled': ref('blue-2'),
  'color-info-light-default': 'rgba(84, 169, 255, 0.2)',
  'color-info-light-hover': 'rgba(84, 169, 255, 0.3)',
  'color-info-light-active': 'rgba(84, 169, 255, 0.4)',
  'color-success': ref('green-5'),
  'color-success-hover': ref('green-6'),
  'color-success-active': ref('green-7'),
  'color-success-disabled': ref('green-2'),
  'color-success-light-default': 'rgba(93, 194, 100, 0.2)',
  'color-success-light-hover': 'rgba(93, 194, 100, 0.3)',
  'color-success-light-active': 'rgba(93, 194, 100, 0.4)',
  'color-warning': ref('orange-5'),
  'color-warning-hover': ref('orange-6'),
  'color-warning-active': ref('orange-7'),
  'color-warning-disabled': ref('orange-2'),
  'color-warning-light-default': 'rgba(255, 174, 67, 0.2)',
  'color-warning-light-hover': 'rgba(255, 174, 67, 0.3)',
  'color-warning-light-active': 'rgba(255, 174, 67, 0.4)',
  'color-danger': ref('red-5'),
  'color-danger-hover': ref('red-6'),
  'color-danger-active': ref('red-7'),
  'color-danger-disabled': ref('red-2'),
  'color-danger-light-default': 'rgba(252, 114, 90, 0.2)',
  'color-danger-light-hover': 'rgba(252, 114, 90, 0.3)',
  'color-danger-light-active': 'rgba(252, 114, 90, 0.4)',
  // —— link ——
  'color-link': ref('blue-5'),
  'color-link-hover': ref('blue-6'),
  'color-link-active': ref('blue-7'),
  'color-link-visited': ref('blue-5'),
  // —— disabled ——
  'color-disabled-text': 'rgba(249, 249, 249, 0.35)',
  'color-disabled-border': ref('grey-1'), // dark grey-1
  'color-disabled-bg': ref('grey-1'),
  'color-disabled-fill': 'rgba(230, 232, 234, 0.04)', // dark grey-8
  // surfaces — Semi 暗色 bg/border/fill
  'color-bg-0': '#16161a',
  'color-bg-1': '#232429',
  'color-bg-2': '#35363c',
  'color-bg-3': '#43444a',
  'color-bg-4': '#4a4d56',
  'color-nav-bg': '#232429',
  'color-bg-inverse': ref('grey-9'),
  'color-overlay-bg': 'rgba(22, 22, 26, 0.6)',
  // 内容遮罩暗色同值：语义即压暗内容显露操作，亮暗一致（对齐 overlay-bg 做法）。
  'color-mask': 'rgba(0, 0, 0, 0.4)',
  'color-border': 'rgba(255, 255, 255, 0.08)',
  'color-fill-0': 'rgba(255, 255, 255, 0.12)',
  'color-fill-1': 'rgba(255, 255, 255, 0.16)',
  'color-fill-2': 'rgba(255, 255, 255, 0.2)',
  'color-shadow': 'rgba(0, 0, 0, 0.04)',
  // focus
  'color-focus': ref('blue-5'),
  'color-focus-border': ref('blue-5'),
  // —— AI general 渐变（Semi 暗色 general-5/6/7；-0 浅蓝→-3 粉，与 light 顺序相反，已按 278deg 从 -0 到 -3 排好）——
  'color-ai-general':
    'linear-gradient(278deg, rgb(234,107,246) 0%, rgb(195,117,255) 30%, rgb(134,129,252) 60%, rgb(91,162,245) 100%)',
  'color-ai-general-hover':
    'linear-gradient(278deg, rgb(243,143,248) 0%, rgb(213,152,255) 30%, rgb(163,160,253) 60%, rgb(131,187,248) 100%)',
  'color-ai-general-active':
    'linear-gradient(278deg, rgb(249,180,251) 0%, rgb(229,186,255) 30%, rgb(192,192,253) 60%, rgb(172,210,250) 100%)',
  // AI general 浅底（Semi 暗色 general-0）：深靛蓝，tertiary solid colorful 背景
  'color-ai-general-light':
    'linear-gradient(278deg, rgb(80,18,101) 0%, rgb(58,23,112) 30%, rgb(39,29,108) 60%, rgb(9,44,100) 100%)',
  // AI general 四色渐变分量（同 light 段：引用 --cd-color-ai-general-5-0..3，paletteDark 下自动取暗色值）。
  'color-ai-general-multiple-0': 'var(--cd-color-ai-general-5-0)',
  'color-ai-general-multiple-1': 'var(--cd-color-ai-general-5-1)',
  'color-ai-general-multiple-2': 'var(--cd-color-ai-general-5-2)',
  'color-ai-general-multiple-3': 'var(--cd-color-ai-general-5-3)',
  'color-ai-general-two-primary': 'var(--cd-color-ai-general-5-1)',
  // AI purple（Semi 暗色 ai-purple-5）
  'color-ai-purple': 'rgb(195,117,255)',
  // —— 镜像 Semi global.scss dark 块（同 light，见上方说明）——
  'color-default': ref('grey-0'),
  'color-default-hover': ref('grey-1'),
  'color-default-active': ref('grey-2'),
  'color-data-0': '#5e6dc2',
  'color-data-1': '#086878',
  'color-data-2': '#faad3f',
  'color-data-3': '#4c2b9c',
  'color-data-4': '#107df8',
  'color-data-5': '#f8ca10',
  'color-data-6': '#c31e57',
  'color-data-7': '#057773',
  'color-data-8': '#9acf0d',
  'color-data-9': '#751d8a',
  'color-data-10': '#10a2b4',
  'color-data-11': '#d06e0b',
  'color-data-12': '#7142c5',
  'color-data-13': '#0764d4',
  'color-data-14': '#fbe86e',
  'color-data-15': '#a01349',
  'color-data-16': '#0bb3a7',
  'color-data-17': '#628a06',
  'color-data-18': '#a230b3',
  'color-data-19': '#28338a',
  'color-ai-background-bottom': 'linear-gradient(201.15deg, rgba(255, 226, 138, 0.2) 6.58%, rgba(231, 45, 255, 0.2) 50.4%, rgba(0, 115, 255, 0.2) 94.23%)',
  'color-ai-background-bottom-hover': 'linear-gradient(201.15deg, rgba(255, 226, 138, 0.3) 6.58%, rgba(231, 45, 255, 0.3) 50.4%, rgba(0, 115, 255, 0.3) 94.23%)',
  'color-ai-background-bottom-active': 'linear-gradient(201.15deg, rgba(255, 226, 138, 0.4) 6.58%, rgba(231, 45, 255, 0.4) 50.4%, rgba(0, 115, 255, 0.4) 94.23%)',
  'color-ai-background-top': 'linear-gradient(201.15deg, rgba(83, 56, 255, 0.36) 6.58%, rgba(176, 48, 240, 0.216) 32.88%, rgba(154, 0, 174, 0.108) 59.17%, rgba(0, 0, 0, 0) 94.23%)',
  'color-ai-background-top-hover': 'linear-gradient(201.15deg, rgba(83, 56, 255, 0.54) 6.58%, rgba(176, 48, 240, 0.324) 32.88%, rgba(154, 0, 174, 0.162) 59.17%, rgba(0, 0, 0, 0) 94.23%)',
  'color-ai-background-top-active': 'linear-gradient(201.15deg, rgba(83, 56, 255, 0.72) 6.58%, rgba(176, 48, 240, 0.432) 32.88%, rgba(154, 0, 174, 0.216) 59.17%, rgba(0, 0, 0, 0) 94.23%)',
};
