/**
 * Component tokens for Dropdown. 全量对齐 Semi Design（semi-foundation/dropdown/variables.scss + dropdown.scss +
 * animation.scss，37 变量），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量（忠实翻译 Semi）。
 *
 * 命名规则：Semi `$` 前缀去除、下划线 `_` kebab 化、camelCase 小写收敛
 * （如 dropdown_menu-paddingY → dropdown-menu-paddingy，dropdown_title_withTick → dropdown-title-withtick）。
 * 映射：--semi-color-* → --cd-color-*；var(--semi-border-radius-*) → var(--cd-border-radius-*)；
 * $spacing-* → var(--cd-spacing-*)；无对应全局档的字面量保留（如 31px / 9px / 280px / 12px / 1px）。
 * filter / transition 归 animation / other。
 *
 * DOM 直接消费这些 Semi 全名 token（dropdown.scss 里 `$color-dropdown_item-bg-hover` →
 * `--cd-color-dropdown-item-bg-hover`），不再经本库自造中间短名（旧的 --cd-dropdown-bg /
 * --cd-dropdown-item-padding / --cd-dropdown-min-width / --cd-dropdown-z / --cd-dropdown-shadow 等
 * 已随本次对齐移除，无向后兼容包袱）。
 *
 * 阴影 / z-index / 背景滤镜：Semi dropdown-wrapper 直接 `@include shadow-elevated` + `z-index:$z-dropdown` +
 * `backdrop-filter:$filter-dropdown-bg`。本库浮层复用 Tooltip 基座（对齐 Semi「Dropdown 封装 Tooltip」），
 * wrapper 的阴影 / 层级由 Tooltip 承载（Tooltip content 已 shadow-elevated + z-dropdown 级），Dropdown content
 * 自身不再重复定义 shadow / z / min-width（Semi 亦无 min-width，variables 里 `min-width:150px` 为注释态）。
 *
 * 视觉对齐点（值忠实 Semi）：
 *  - 浮层背景 color-dropdown-bg-default = --cd-color-bg-3（亮色 #fff）。
 *  - 浮层圆角 radius-dropdown = --cd-border-radius-medium。
 *  - 菜单项 hover 背景 color-dropdown-item-bg-hover = --cd-color-fill-0；按下 bg-active = fill-1。
 *  - 菜单项内边距 item-paddingY/paddingX = tight / base。
 *  - type 五色（primary/secondary/tertiary/warning/danger）文字色映射各语义色。
 *  - 选中项（active）字重 600；showTick 时项/标题左内边距让位对勾。
 */
import type { TokenGroup } from './token-def.js';

export const dropdownTokens = {
  // —— 圆角 ——
  'radius-dropdown': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '下拉菜单圆角', usage: '下拉菜单圆角大小（浮层 wrapper）' },
  'radius-dropdown-item': { value: '0px', category: 'radius', label: '菜单项圆角', usage: '下拉菜单项圆角大小' },

  // —— 颜色 ——
  'color-dropdown-bg-default': { value: 'var(--cd-color-bg-3)', category: 'color', label: '默认背景色', usage: '下拉菜单背景颜色' },
  'color-dropdown-title-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '分组标题文字色', usage: '下拉菜单分组标题文字颜色' },

  // —— 菜单内边距 ——
  'spacing-dropdown-menu-paddingy': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '菜单垂直内边距', usage: '下拉菜单垂直内边距' },
  'spacing-dropdown-menu-paddingx': { value: '0', category: 'spacing', label: '菜单水平内边距', usage: '下拉菜单水平内边距' },

  // —— 分组标题内边距 ——
  'spacing-dropdown-title-paddingtop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '标题顶内边距', usage: '下拉菜单分组标题顶部内边距' },
  'spacing-dropdown-title-paddingbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '标题底内边距', usage: '下拉菜单分组标题底部内边距' },
  'spacing-dropdown-title-paddingleft': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '标题左内边距', usage: '下拉菜单分组标题左侧内边距' },
  'spacing-dropdown-title-paddingright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '标题右内边距', usage: '下拉菜单分组标题右侧内边距' },
  'spacing-dropdown-title-withtick-paddingleft': { value: '31px', category: 'spacing', label: '可选标题左内边距', usage: '可选中的下拉菜单，分组标题左侧内边距' },
  'spacing-dropdown-item-withtick-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '可选项对勾左内边距', usage: '可选中的下拉菜单项，对勾 icon 左侧内边距' },

  // —— 菜单项内边距 ——
  'spacing-dropdown-item-paddingy': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '菜单项垂直内边距', usage: '下拉菜单项垂直内边距' },
  'spacing-dropdown-item-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '菜单项水平内边距', usage: '下拉菜单项水平内边距' },

  // —— 菜单项颜色 ——
  'color-dropdown-item-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '菜单项文字色', usage: '下拉菜单项文字颜色' },
  'color-dropdown-item-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '菜单项悬浮背景', usage: '下拉菜单项背景颜色 - 悬浮' },
  'color-dropdown-item-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '菜单项按下背景', usage: '下拉菜单项背景颜色 - 按下' },
  'color-dropdown-item-danger-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '危险项文字色', usage: '危险菜单项文字颜色' },
  'color-dropdown-item-secondary-text-default': { value: 'var(--cd-color-secondary)', category: 'color', label: '二级项文字色', usage: '二级菜单项文字颜色' },
  'color-dropdown-item-warning-text-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告项文字色', usage: '警告菜单项文字颜色' },
  'color-dropdown-item-tertiary-text-default': { value: 'var(--cd-color-tertiary)', category: 'color', label: '三级项文字色', usage: '第三菜单项文字颜色' },
  'color-dropdown-item-primary-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '主要项文字色', usage: '主要菜单项文字颜色' },
  'color-dropdown-item-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用项文字色', usage: '禁用菜单项文字颜色' },
  'color-dropdown-item-disabled-bg-default': { value: 'transparent', category: 'color', label: '禁用项背景色', usage: '禁用菜单项背景颜色' },
  'color-dropdown-seperator-bg-default': { value: 'var(--cd-color-border)', category: 'color', label: '分隔线颜色', usage: '菜单项分隔线颜色' },

  // —— 图标 / 分隔线间距 ——
  'spacing-dropdown-icon-marginright': { value: '9px', category: 'spacing', label: '图标右外边距', usage: '菜单项图标右侧外边距' },
  'spacing-dropdown-seperator-marginy': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '分隔线垂直外边距', usage: '菜单项分隔线垂直外边距' },
  'spacing-dropdown-seperator-marginx': { value: '0', category: 'spacing', label: '分隔线水平外边距', usage: '菜单项分隔线水平外边距' },

  // —— 尺寸 ——
  'width-dropdown': { value: '280px', category: 'width', label: '菜单最大宽度', usage: '菜单最大宽度' },
  'size-dropdown-icon-width': { value: '12px', category: 'width', label: '图标宽度', usage: '菜单项图标宽度' },
  'size-dropdown-icon-height': { value: '12px', category: 'height', label: '图标高度', usage: '菜单项图标高度' },
  'height-dropdown-seperator': { value: '1px', category: 'height', label: '分隔线高度', usage: '菜单项分隔线宽度' },

  // —— 字重 ——
  'font-dropdown-item-active-fontweight': { value: '600', category: 'font', label: '选中项字重', usage: '选中菜单项字重' },

  // —— 菜单项背景过渡（Semi animation.scss：$transition_duration/function/delay-dropdown_item-bg） ——
  'transition-dropdown-item-bg-duration': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '项背景过渡时长', usage: '下拉菜单项背景色过渡时长（默认 none）' },
  'transition-dropdown-item-bg-function': { value: 'var(--cd-motion-ease-standard)', category: 'animation', label: '项背景过渡曲线', usage: '下拉菜单项背景色过渡曲线（easeOut）' },
  'transition-dropdown-item-bg-delay': { value: '0ms', category: 'animation', label: '项背景过渡延迟', usage: '下拉菜单项背景色过渡延迟' },

  // —— 滤镜（Semi $filter-dropdown-bg） ——
  'filter-dropdown-bg': { value: 'none', category: 'other', label: '背景滤镜', usage: '下拉菜单背景滤镜（backdrop-filter）' },
} satisfies TokenGroup;
