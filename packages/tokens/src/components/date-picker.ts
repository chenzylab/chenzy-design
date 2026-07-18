/**
 * Component tokens for DatePicker。仅保留 DatePicker.svelte / RangePicker.svelte 实际消费的
 * token（Token 精简原则：只留组件真消费的，删孤儿）。曾全量对齐 Semi 的 ~220 个变量，其中
 * 组件未消费的已按孤儿清理删除。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 *
 * 命名/映射约定（历史沿袭，逐条亲验 Semi variables.scss + 我们的 global/scales.ts + alias/index.ts）：
 * - Semi `$color-datepicker_xxx` → kebab `color-date-picker-xxx`（datepicker → date-picker）。
 * - Semi `var(--semi-color-*)` → 我们 `var(--cd-color-*)`（语义名一一对应）。
 * - Semi `$border-thickness-control` → `var(--cd-border-thickness-control)`（1px）；
 *   `$border-thickness-control-focus` → `var(--cd-border-thickness-control-focus)`。
 * - Semi `$spacing-tight/-base-tight/-base/-base-loose` → 我们 `var(--cd-spacing-*)`。
 * - Semi `var(--semi-border-radius-small/medium)` → 我们 `var(--cd-border-radius-small/medium)`。
 * - usage 忠实照抄 Semi 中文注释（含原注释错别字）。
 *
 * 阶段4 已去中间层：删除与 `color-date-picker-*` 镜像段语义重复的自造名（cell-bg-selected 等），
 * CSS 直接消费镜像名。末尾「组件消费段」仅保留 Semi 确无独立变量的浮层容器 token（panel
 * shadow/radius/z，Semi 走 popover）+ 日期格圆角/非本月弱化色。
 * 注：`date-picker-time-col-width`/`-time-item-height` 已迁移至 time-picker.ts。
 */
import type { TokenGroup } from './token-def.js';

export const datePickerTokens = {
  // ============================ Size ============================
  'height-date-picker-panel-yam-scrolllist': { value: '266px', category: 'height', label: '年月列表滚动区高度', usage: '年月选择列表滚动区域高度' },
  'height-date-picker-timepicker-header-min': { value: '24px', category: 'height', label: '年月面板顶栏最小高度', usage: '年月选择面板顶部导航栏最小高度' },
  'height-date-picker-yam-showing-min': { value: '378px', category: 'height', label: '日期时间选择器最小高度', usage: '日期时间选择器菜单最小高度' },
  'width-date-picker-yam-showing-min': { value: '284px', category: 'width', label: '选择器菜单最小宽度', usage: '选择器菜单最小宽度' },
  'width-date-picker-panel-yam-scrolllist-li-min': { value: '64px', category: 'width', label: '滚动菜单项最小高度', usage: '年月、时间滚动菜单项最小高度' },
  'width-date-picker-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '年月顶栏分割线宽度', usage: '年月选择面板顶部导航栏底部分割线宽度' },
  'width-date-picker-yam-header-border-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '年月顶栏圆角', usage: '年月选择面板顶部导航栏圆角' },
  'width-date-picker-quick-control-border-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '快捷操作按钮圆角', usage: '快捷操作按钮圆角' },
  'width-date-picker-range-input-border': { value: 'var(--cd-border-thickness-control-focus)', category: 'width', label: '范围输入描边宽度', usage: '' },
  'width-date-picker-inset-input-date-type-wrapper': { value: '284px', category: 'width', label: '日期内嵌输入框宽度', usage: '日期类型内嵌输入框宽度' },
  'width-date-picker-panel-list': { value: '56px', category: 'width', label: '时间列列宽', usage: 'dateTime 面板时间列（ScrollList）列宽，对齐 Semi 时间列' },
  'height-date-picker-panel-list-body': { value: '224px', category: 'height', label: '时间列面板高度', usage: 'dateTime 面板时间列（ScrollList）视窗高度，与日历网格视觉对齐' },
  // 日期格双层：Semi $width-datepicker_day=36px（外框/点击区，含间距）+ $width-datepicker_day_main=32px（内容/圆角高亮）
  'width-date-picker-day': { value: '36px', category: 'width', label: '日期格外框尺寸', usage: 'Semi $width-datepicker_day 日期格外框（点击区 + 间距），星期标题同宽' },
  'width-date-picker-day-main': { value: '32px', category: 'width', label: '日期格内容尺寸', usage: 'Semi $width-datepicker_day_main 日期格内容（圆角高亮区）' },
  // compact 密度：Semi 精确值 28/24，非 32*0.85 近似
  'width-date-picker-day-compact': { value: '28px', category: 'width', label: '紧凑日期格外框尺寸', usage: 'Semi $width-datepicker_day_compact' },
  'width-date-picker-day-main-compact': { value: '24px', category: 'width', label: '紧凑日期格内容尺寸', usage: 'Semi $width-datepicker_day_main_compact' },

  // ============================ Spacing ============================
  'spacing-date-picker-yam-header-padding-x': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '年月顶栏水平内边距', usage: '年月选择面板顶部导航栏水平内边距' },
  'spacing-date-picker-yam-header-padding-y': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '年月顶栏垂直内边距', usage: '年月选择面板顶部导航栏垂直内边距' },
  'spacing-date-picker-scrolllist-header-padding': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '时间选择 header 内边距', usage: '时间选择 header 内边距' },
  'spacing-date-picker-scrolllist-body-padding': { value: '0', category: 'spacing', label: '时间滚动菜单内边距', usage: '时间选择滚动菜单内边距' },
  'spacing-date-picker-inset-input-wrapper-margin': { value: '8px', category: 'spacing', label: '内嵌输入外边距', usage: '' },
  'spacing-date-picker-inset-input-wrapper-padding-y': { value: '12px', category: 'spacing', label: '内嵌输入垂直内边距', usage: '' },
  'spacing-date-picker-inset-input-wrapper-padding-x': { value: '16px', category: 'spacing', label: '内嵌输入水平内边距', usage: '' },
  'spacing-date-picker-inset-input-wrapper-padding-bottom': { value: '0', category: 'spacing', label: '内嵌输入底部内边距', usage: '' },
  'spacing-date-picker-inset-input-separator-padding-x': { value: '4px', category: 'spacing', label: '内嵌输入分隔符水平内边距', usage: '' },

  // ============================ Color ============================
  'color-date-picker-panel-bg-default': { value: 'var(--cd-color-bg-3)', category: 'color', label: '面板背景色', usage: 'Semi $color-datepicker_panel-bg-default 日期选择器背景颜色（bg-3）' },
  'color-date-picker-footer-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: 'footer 背景色', usage: 'Semi $color-datepicker_footer-bg-default 确认选择 footer 背景（fill-0）' },
  'color-date-picker-day-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '星期标题文字色', usage: 'Semi $color-datepicker_day-text-default 星期标题及日期时间切换按钮文字 - 默认（text-2）' },
  'color-date-picker-day-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '日期切换选中文字色', usage: 'Semi $color-datepicker_day-text-active header 标题文字 - 选中（text-0）' },
  'color-date-picker-date-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '日期格悬浮背景色', usage: 'Semi $color-datepicker_date-bg-hover 日期格背景 - 悬浮（fill-0）' },
  'color-date-picker-border-bg-default': { value: 'var(--cd-color-border)', category: 'color', label: '描边色', usage: '日期选择器描边颜色' },
  'color-date-picker-quick-bg-default': { value: 'transparent', category: 'color', label: '快捷操作背景色', usage: '日期选择器快捷操作背景颜色' },
  'color-date-picker-quick-button-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '快捷操作按钮文字色', usage: '日期选择器快捷操作按钮文字颜色' },
  'color-date-picker-date-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '日期格子文字色', usage: '日期格子文字颜色 - 默认' },
  'color-date-picker-date-selected-text-default': { value: 'var(--cd-color-white)', category: 'color', label: '选中日期文字色', usage: '日期格子文字颜色 - 选中' },
  'color-date-picker-date-selected-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中日期背景色', usage: '日期格子背景颜色 - 选中' },
  'color-date-picker-date-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用日期文字色', usage: '禁用日期格子文字颜色' },
  'color-date-picker-date-today-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '今日文字色', usage: '今日文字颜色' },
  'color-date-picker-date-in-hover-bg-default': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '范围选择日期格子色', usage: '范围选择日期格子颜色' },
  'color-date-picker-nav-month-icon-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '顶栏年月文字色', usage: '顶部导航栏年月文字颜色 - 默认' },
  'color-date-picker-nav-icon-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: 'header 箭头色', usage: '日期选择器 header 左右箭头颜色' },
  'color-date-picker-range-input-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '范围输入背景色', usage: '' },
  'color-date-picker-range-input-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '范围输入背景色-悬浮', usage: '' },
  'color-date-picker-range-input-border-default': { value: 'transparent', category: 'color', label: '范围输入描边色', usage: '' },
  'color-date-picker-range-input-border-active': { value: 'var(--cd-color-focus-border)', category: 'color', label: '范围输入描边色-激活', usage: '' },
  'color-date-picker-range-input-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文字色', usage: '' },
  'color-date-picker-range-input-disabled-bg-default': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '' },
  'color-date-picker-range-input-input-wrapper-bg-focus': { value: 'var(--cd-color-fill-1)', category: 'color', label: '范围输入内框背景色-聚焦', usage: '' },

  // ============================ compact / inset-input ============================
  'radius-date-picker-range-input-input-wrapper': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '范围输入内框圆角', usage: '' },
  'height-date-picker-range-input-default': { value: '32px', category: 'height', label: '范围输入高度-默认', usage: '' },
  'width-date-picker-inset-input-date-type-wrapper-compact': { value: '216px', category: 'width', label: '紧凑日期内嵌输入框宽度', usage: '' },
  'height-date-picker-inset-input-wrapper-compact': { value: '28px', category: 'height', label: '紧凑内嵌输入外框高度', usage: '' },
  'font-size-date-picker-inset-input-compact-font-size': { value: '12px', category: 'font', label: '紧凑内嵌输入字号', usage: '' },
  'spacing-date-picker-inset-input-wrapper-compact-margin': { value: '4px', category: 'spacing', label: '紧凑内嵌输入外边距', usage: '' },
  'spacing-date-picker-inset-input-wrapper-compact-padding-y': { value: '8px', category: 'spacing', label: '紧凑内嵌输入垂直内边距', usage: '' },
  'spacing-date-picker-inset-input-wrapper-compact-padding-x': { value: '8px', category: 'spacing', label: '紧凑内嵌输入水平内边距', usage: '' },
  'spacing-date-picker-inset-input-wrapper-compact-padding-bottom': { value: '0', category: 'spacing', label: '紧凑内嵌输入底部内边距', usage: '' },

  // ============================ Other ============================
  'transition-date-picker-range-input': { value: 'background-color .16s ease-in-out', category: 'animation', label: '范围输入过渡', usage: '' },

  // ============================ 组件消费段（Semi 无独立变量：面板走 popover，本库以浮层 token 承载）============================
  // 去中间层后，仅保留 Semi 确实没有对应变量的浮层容器 token（panel shadow/radius/z）与日期格圆角/弱化色。
  // 语义与 Semi 镜像段重复的自造名（cell-bg-selected/cell-color-selected 等）已删除，CSS 直接消费镜像名。
  'shadow-date-picker-panel': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '面板阴影', usage: '日期面板阴影（Semi 走 popover 无独立变量）' },
  'radius-date-picker-panel': { value: 'var(--cd-border-radius-large)', category: 'radius', label: '面板圆角', usage: '日期面板圆角（Semi 走 popover 无独立变量）' },
  'z-date-picker-panel': { value: 'var(--cd-z-popover)', category: 'other', label: '面板层级', usage: '日期面板 z-index（Semi 走 zIndex prop 无 token）' },
  'radius-date-picker-day-main': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '日期格圆角', usage: 'Semi $width-datepicker_day_main-borderRadius 日期格内容圆角（small）' },
  'color-date-picker-date-muted-text-default': { value: 'var(--cd-color-text-3)', category: 'color', label: '非本月日期文字色', usage: '非当前月日期格弱化文字（text-3）' },
} satisfies TokenGroup;
