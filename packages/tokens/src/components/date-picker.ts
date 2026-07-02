/**
 * Component tokens for DatePicker. 全量对齐 Semi Design（semi-foundation/datePicker/variables.scss
 * 262 行，~220 变量），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 *
 * 映射约定（逐条亲验 Semi variables.scss + 我们的 global/scales.ts + alias/index.ts）：
 * - Semi `$color-datepicker_xxx` → kebab `color-date-picker-xxx`（datepicker → date-picker）。
 * - Semi `var(--semi-color-*)` → 我们 `var(--cd-color-*)`（语义名一一对应）。
 *   Semi `var(--semi-color-white)` 我们无 --cd-color-white alias，用最接近的
 *   `var(--cd-color-text-inverse)`（= #ffffff）替代（对齐 Checkbox 的做法）。
 * - Semi `$border-thickness-control` → `var(--cd-border-thickness-control)`（1px）；
 *   `$border-thickness-control-focus` → `var(--cd-border-thickness-control-focus)`。
 * - Semi `$spacing-tight/-base-tight/-base/-base-loose` → 我们 `var(--cd-spacing-*)`；
 *   `$spacing-tight - 2px` → `calc(var(--cd-spacing-tight) - 2px)`。
 * - Semi `var(--semi-border-radius-small/medium)` → 我们 `var(--cd-border-radius-small/medium)`。
 * - Semi 同文件 calc/嵌套引用 `$width-datepicker_day * 7` → 引用我们的 kebab token 全名（含
 *   category 前缀，因为 build.ts 组件 token emit 为 `--cd-<key>`，key 已含 width-/spacing-/… 前缀）：
 *   `calc(var(--cd-width-date-picker-day) * 7)`。负值 `- $x` → `calc(-1 * var(--cd-x))`。
 * - usage 忠实照抄 Semi 中文注释（含原注释错别字）。
 *
 * 末尾「组件消费补充段」保留 DatePicker.svelte/RangePicker.svelte 实际消费的老
 * `date-picker-*` token（Semi 无独立变量），升级为 TokenDef、原名原值。
 * 注：`date-picker-time-col-width`/`-time-item-height` 已迁移至 time-picker.ts，不再定义。
 */
import type { TokenGroup } from './token-def.js';

export const datePickerTokens = {
  // ============================ Size ============================
  'width-date-picker-day': { value: '36px', category: 'width', label: '日期格子尺寸', usage: '日期格子及星期标题尺寸' },
  'width-date-picker-day-main': { value: '32px', category: 'width', label: '日期格子内容尺寸', usage: '日期格子内容尺寸' },
  'width-date-picker-month': { value: 'calc(var(--cd-width-date-picker-day) * 7)', category: 'width', label: '单月面板宽度', usage: '日期视图单月面板宽度' },
  'width-date-picker-nav': { value: '32px', category: 'width', label: '顶部导航栏高度', usage: '顶部导航栏高度' },
  'height-date-picker-switch': { value: '54px', category: 'height', label: '日期时间切换高度', usage: '日期时间切换高度' },
  'height-date-picker-time-type-yam': { value: 'calc(100% - 54px)', category: 'height', label: '时间面板高度', usage: '时间面板高度' },
  'height-date-picker-time-type-tpk': { value: 'calc(100% - 54px)', category: 'height', label: '时间面板高度', usage: '时间面板高度' },
  'height-date-picker-panel-yam-scrolllist': { value: '266px', category: 'height', label: '年月列表滚动区高度', usage: '年月选择列表滚动区域高度' },

  'width-date-picker-month-panel-max': { value: '284px', category: 'width', label: '年月选择器最大宽度', usage: '年月选择器最大宽度' },
  'width-date-picker-month-range-panel-max': { value: '384px', category: 'width', label: '年月选择器最大宽度', usage: '年月选择器最大宽度' },
  'height-date-picker-timepicker-header-min': { value: '24px', category: 'height', label: '年月面板顶栏最小高度', usage: '年月选择面板顶部导航栏最小高度' },
  'width-date-picker-navigation-button-min': { value: '32px', category: 'width', label: '顶栏按钮最小宽度', usage: '顶部导航栏按钮最小宽度' },
  'height-date-picker-yam-showing-min': { value: '378px', category: 'height', label: '日期时间选择器最小高度', usage: '日期时间选择器菜单最小高度' },
  'width-date-picker-yam-showing-min': { value: '284px', category: 'width', label: '选择器菜单最小宽度', usage: '选择器菜单最小宽度' },
  'height-date-picker-date-type-yam-showing-min': { value: '325px', category: 'height', label: '日期选择器最小高度', usage: '日期选择器菜单最小高度' },
  'width-date-picker-panel-yam-scrolllist-li-min': { value: '64px', category: 'width', label: '滚动菜单项最小高度', usage: '年月、时间滚动菜单项最小高度' },
  'width-date-picker-preset-panel-left-and-right': { value: '200px', category: 'width', label: '左右快捷面板宽度', usage: '左右方位快捷选择面板宽度' },
  'height-date-picker-preset-panel-top-and-bottom-max': { value: '100px', category: 'height', label: '上下快捷面板最大高度', usage: '上下方位快捷选择面板最大高度' },
  'width-date-picker-preset-panel-scroll-bar': { value: '15px', category: 'width', label: '快捷面板滚动条宽度', usage: '快捷选择面板scrollbar宽度' },

  'width-date-picker-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '年月顶栏分割线宽度', usage: '年月选择面板顶部导航栏底部分割线宽度' },
  'width-date-picker-yam-header-border-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '年月顶栏圆角', usage: '年月选择面板顶部导航栏圆角' },
  'width-date-picker-day-main-border-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '日期格子圆角', usage: '日期格子圆角' },
  'width-date-picker-quick-control-border-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '快捷操作按钮圆角', usage: '快捷操作按钮圆角' },
  'width-date-picker-slot-border': { value: '1px', category: 'width', label: '日期星期分割线宽度', usage: '日期星期分割线宽度' },
  'width-date-picker-range-input-border': { value: 'var(--cd-border-thickness-control-focus)', category: 'width', label: '范围输入描边宽度', usage: '' },
  'width-date-picker-day-main-border': { value: '1px', category: 'width', label: '日期格子描边宽度', usage: '' },
  'height-date-picker-time-type-inset-input-yam': { value: '100%', category: 'height', label: '内嵌输入时间面板高度', usage: '时间面板高度 - 内嵌输入框' },
  'height-date-picker-time-type-inset-input-tpk': { value: '100%', category: 'height', label: '内嵌输入时间面板高度', usage: '时间面板高度 - 内嵌输入框' },
  'width-date-picker-inset-input-date-type-wrapper': { value: '284px', category: 'width', label: '日期内嵌输入框宽度', usage: '日期类型内嵌输入框宽度' },
  'width-date-picker-inset-input-date-range-type-wrapper': { value: 'calc(var(--cd-width-date-picker-inset-input-date-type-wrapper) * 2)', category: 'width', label: '范围内嵌输入框宽度', usage: '范围选择内嵌输入框宽度' },
  'width-date-picker-inset-input-month-type-wrapper': { value: '165px', category: 'width', label: '月份内嵌输入框宽度', usage: '月份类型内嵌输入框宽度' },
  'width-date-picker-inset-input-month-range-type-wrapper': { value: '331px', category: 'width', label: '年月范围内嵌输入框宽度', usage: '年月范围类型内嵌输入框宽度' },
  'height-date-picker-inset-input-separator': { value: '32px', category: 'height', label: '内嵌输入分隔符高度', usage: '' },
  'height-date-picker-month-grid-year-type-inset-input': { value: '317px', category: 'height', label: '年类型月网格高度', usage: '' },
  'height-date-picker-month-grid-time-type-inset-input': { value: '317px', category: 'height', label: '时间类型月网格高度', usage: '' },
  'width-date-picker-range-trigger-border': { value: '0px', category: 'width', label: '触发器边框宽度', usage: '触发器边框宽度' },

  // ============================ Spacing ============================
  'spacing-date-picker-day-margin-x': { value: 'calc((var(--cd-width-date-picker-day) - var(--cd-width-date-picker-day-main)) * 0.5)', category: 'spacing', label: '日期格子水平外边距', usage: '日期格子水平外边距' },
  'spacing-date-picker-yam-header-padding-x': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '年月顶栏水平内边距', usage: '年月选择面板顶部导航栏水平内边距' },
  'spacing-date-picker-yam-header-padding-y': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '年月顶栏垂直内边距', usage: '年月选择面板顶部导航栏垂直内边距' },
  'spacing-date-picker-scrolllist-header-padding': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '时间选择 header 内边距', usage: '时间选择 header 内边距' },
  'spacing-date-picker-scrolllist-body-padding': { value: '0', category: 'spacing', label: '时间滚动菜单内边距', usage: '时间选择滚动菜单内边距' },
  'spacing-date-picker-footer-padding-top': { value: '10px', category: 'spacing', label: 'footer 顶部内边距', usage: '确认选择 footer 顶部内边距' },
  'spacing-date-picker-footer-padding-bottom': { value: '10px', category: 'spacing', label: 'footer 底部内边距', usage: '确认选择 footer 底部内边距' },
  'spacing-date-picker-footer-padding-right': { value: '8px', category: 'spacing', label: 'footer 右侧内边距', usage: '确认选择 footer 右侧内边距' },
  'spacing-date-picker-footer-cancel-button-margin-right': { value: '12px', category: 'spacing', label: 'footer 取消按钮右外边距', usage: '确认选择 footer 取消按钮右外边距' },
  'spacing-date-picker-footer-confirm-button-margin-right': { value: '8px', category: 'spacing', label: 'footer 确认按钮右外边距', usage: '确认选择 footer 确认按钮右外边距' },
  'spacing-date-picker-navigation-padding-y': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '年月切换 header 垂直内边距', usage: '年月切换 header 垂直内边距' },
  'spacing-date-picker-navigation-padding-x': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '年月切换 header 水平内边距', usage: '年月切换 header 水平内边距' },
  'spacing-date-picker-month-padding': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '月面板内边距', usage: '' },
  'spacing-date-picker-switch-datetime-padding-top': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '日期时间切换顶部内边距', usage: '日期时间切换顶部内边距' },
  'spacing-date-picker-switch-datetime-padding-bottom': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '日期时间切换底部内边距', usage: '日期时间切换底部内边距' },
  'spacing-date-picker-switch-text-padding-left': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '日期时间切换左侧内边距', usage: '日期时间切换左侧内边距' },
  'spacing-date-picker-quick-control-header-padding-top': { value: '18px', category: 'spacing', label: '快捷预设面板标题上内边距', usage: '快捷预设面板标题区域上内边距' },
  'spacing-date-picker-quick-control-top-and-bottom-content-padding-x': { value: 'var(--cd-spacing-base-loose)', category: 'spacing', label: '上下快捷面板左右内边距', usage: '上下方位快捷操作面板, 左右内边距，默认20px' },
  'spacing-date-picker-quick-control-content-padding-x': { value: '12px', category: 'spacing', label: '快捷面板内容左右内边距', usage: '快捷面板内容，左右内边距' },
  'spacing-date-picker-quick-control-content-margin-top': { value: '14px', category: 'spacing', label: '快捷面板内容上边距', usage: '快捷面板内容，上边距' },
  'spacing-date-picker-quick-control-item-margin': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '快捷操作面板按钮间距', usage: '快捷操作面板按钮间距' },
  'spacing-date-picker-range-input-padding-x': { value: '8px', category: 'spacing', label: '范围输入水平内边距', usage: '' },
  'spacing-date-picker-range-input-padding-y': { value: '3px', category: 'spacing', label: '范围输入垂直内边距', usage: '' },
  'spacing-date-picker-range-input-input-wrapper-input-padding-y': { value: '2px', category: 'spacing', label: '范围输入内框垂直内边距', usage: '' },
  'spacing-date-picker-range-input-input-wrapper-input-padding-x': { value: '4px', category: 'spacing', label: '范围输入内框水平内边距', usage: '' },
  'spacing-date-picker-range-input-prefix-padding-left': { value: '12px', category: 'spacing', label: '范围输入前缀左内边距', usage: '' },
  'spacing-date-picker-range-input-prefix-padding-right': { value: '8px', category: 'spacing', label: '范围输入前缀右内边距', usage: '' },
  'spacing-date-picker-range-input-suffix-padding-left': { value: '8px', category: 'spacing', label: '范围输入后缀左内边距', usage: '' },
  'spacing-date-picker-range-input-suffix-padding-right': { value: '12px', category: 'spacing', label: '范围输入后缀右内边距', usage: '' },
  'spacing-date-picker-range-input-clearbtn-padding-left': { value: '8px', category: 'spacing', label: '范围输入清除按钮左内边距', usage: '' },
  'spacing-date-picker-range-input-clearbtn-padding-right': { value: '12px', category: 'spacing', label: '范围输入清除按钮右内边距', usage: '' },
  'spacing-date-picker-navigation-inset-input-padding-y': { value: '8px', category: 'spacing', label: '内嵌年月切换垂直内边距', usage: '年月切换 header 垂直内边距 - 内嵌输入框' },
  'spacing-date-picker-inset-input-wrapper-margin': { value: '8px', category: 'spacing', label: '内嵌输入外边距', usage: '' },
  'spacing-date-picker-inset-input-wrapper-padding-y': { value: '12px', category: 'spacing', label: '内嵌输入垂直内边距', usage: '' },
  'spacing-date-picker-inset-input-wrapper-padding-x': { value: '16px', category: 'spacing', label: '内嵌输入水平内边距', usage: '' },
  'spacing-date-picker-inset-input-wrapper-padding-bottom': { value: '0', category: 'spacing', label: '内嵌输入底部内边距', usage: '' },
  'spacing-date-picker-inset-input-separator-padding-y': { value: '0', category: 'spacing', label: '内嵌输入分隔符垂直内边距', usage: '' },
  'spacing-date-picker-inset-input-separator-padding-x': { value: '4px', category: 'spacing', label: '内嵌输入分隔符水平内边距', usage: '' },
  'spacing-scroll-list-item-wheel-list-outer-padding-right': { value: '18px', category: 'spacing', label: '滚轮列表外层右内边距', usage: '' },

  // ============================ Color ============================
  'color-date-picker-panel-bg-default': { value: 'var(--cd-color-bg-3)', category: 'color', label: '面板背景色', usage: '日期选择器背景颜色' },
  'color-date-picker-header-bg-default': { value: 'var(--cd-color-bg-3)', category: 'color', label: 'header 背景色', usage: '日期选择器 header 背景颜色' },
  'color-date-picker-list-bg-default': { value: 'var(--cd-color-bg-3)', category: 'color', label: '滚动列表背景色', usage: '日期选择器滚动列表背景颜色' },
  'color-date-picker-border-bg-default': { value: 'var(--cd-color-border)', category: 'color', label: '描边色', usage: '日期选择器描边颜色' },
  'color-date-picker-footer-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: 'footer 背景色', usage: '日期选择器确认选择 footer 背景颜色' },
  'color-date-picker-quick-bg-default': { value: 'transparent', category: 'color', label: '快捷操作背景色', usage: '日期选择器快捷操作背景颜色' },
  'color-date-picker-quick-button-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '快捷操作按钮文字色', usage: '日期选择器快捷操作按钮文字颜色' },

  'color-date-picker-day-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '星期/切换文字色', usage: '星期标题及日期时间切换按钮文字颜色 - 默认' },
  'color-date-picker-day-text-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '日期时间切换文字色', usage: '日期时间切换文字颜色 - 悬浮' },
  'color-date-picker-day-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '日期时间切换文字色', usage: '日期时间切换文字颜色 - 选中' },

  'color-date-picker-date-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '日期格子文字色', usage: '日期格子文字颜色 - 默认' },
  'color-date-picker-date-text-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '日期格子文字色', usage: '日期格子文字颜色 - 悬浮' },
  'color-date-picker-date-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '日期格子文字色', usage: '日期格子文字颜色 - 按下' },
  'color-date-picker-date-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '日期格子背景色', usage: '日期格子背景颜色 - 默认' },
  'color-date-picker-date-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '日期格子背景色', usage: '日期格子背景颜色 - 悬浮' },
  'color-date-picker-date-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '日期格子背景色', usage: '日期格子背景颜色 - 按下' },

  'color-date-picker-date-selected-text-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '选中日期文字色', usage: '日期格子文字颜色 - 选中' },
  'color-date-picker-date-selected-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中日期背景色', usage: '日期格子背景颜色 - 选中' },

  'color-date-picker-date-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用日期文字色', usage: '禁用日期格子文字颜色' },
  'color-date-picker-date-disabled-bg-default': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用日期背景色', usage: '禁用日期格子背景颜色' },

  'color-date-picker-date-today-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '今日文字色', usage: '今日文字颜色' },
  'color-date-picker-date-today-disabled-text-default': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '今日文字色-禁用', usage: '今日文字颜色 - 禁用' },

  'color-date-picker-date-in-hover-bg-default': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '范围选择日期格子色', usage: '范围选择日期格子颜色' },
  'color-date-picker-date-in-range-hover-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '范围悬停路径背景色', usage: '范围选择时悬停路径内的日期背景色' },
  'color-date-picker-date-hover-day-bg-default': { value: 'var(--cd-color-fill-1)', category: 'color', label: '范围悬停日期背景色', usage: '范围选择时日期格子背景色 - 悬停' },
  'color-date-picker-date-selected-range-bg-hover': { value: 'var(--cd-color-primary-light-hover)', category: 'color', label: '范围选择日期格子色-悬浮', usage: '范围选择日期格子颜色 - 悬浮' },
  'color-date-picker-date-hover-day-range-bg-default': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '范围悬停日期段背景色', usage: '' },
  'color-date-picker-date-hover-day-around-single-selected-bg-default': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '单选周边悬停背景色', usage: '' },

  'color-date-picker-nav-month-icon-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '顶栏年月文字色', usage: '顶部导航栏年月文字颜色 - 默认' },
  'color-date-picker-nav-icon-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: 'header 箭头色', usage: '日期选择器 header 左右箭头颜色' },
  'color-date-picker-input-primary-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '输入框主色文字', usage: '' },
  'color-date-picker-range-input-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '范围输入文字色', usage: '' },
  'color-date-picker-range-input-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '范围输入背景色', usage: '' },
  'color-date-picker-range-input-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '范围输入背景色-悬浮', usage: '' },
  'color-date-picker-range-input-border-default': { value: 'transparent', category: 'color', label: '范围输入描边色', usage: '' },
  'color-date-picker-range-input-border-active': { value: 'var(--cd-color-focus-border)', category: 'color', label: '范围输入描边色-激活', usage: '' },
  'color-date-picker-range-input-warning-border-active': { value: 'var(--cd-color-warning)', category: 'color', label: '警告描边色-激活', usage: '' },
  'color-date-picker-range-input-warning-bg-active': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警告背景色-激活', usage: '' },
  'color-date-picker-range-input-warning-bg-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告背景色', usage: '' },
  'color-date-picker-range-input-warning-bg-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警告背景色-悬浮', usage: '' },
  'color-date-picker-range-input-warning-border-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '警告描边色', usage: '' },
  'color-date-picker-range-input-warning-border-hover': { value: 'var(--cd-color-warning-light-hover)', category: 'color', label: '警告描边色-悬浮', usage: '' },
  'color-date-picker-range-input-error-border-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '错误描边色', usage: '' },
  'color-date-picker-range-input-error-bg-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '错误背景色', usage: '' },
  'color-date-picker-range-input-error-border-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '错误描边色-悬浮', usage: '' },
  'color-date-picker-range-input-error-bg-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '错误背景色-悬浮', usage: '' },
  'color-date-picker-range-input-error-border-active': { value: 'var(--cd-color-danger)', category: 'color', label: '错误描边色-激活', usage: '' },
  'color-date-picker-range-input-error-bg-active': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '错误背景色-激活', usage: '' },
  'color-date-picker-range-input-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文字色', usage: '' },
  'color-date-picker-range-input-disabled-bg-default': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '' },
  'color-date-picker-range-input-disabled-bg-hover': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色-悬浮', usage: '' },
  'color-date-picker-range-input-clearbtn-icon-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '清除按钮图标色-悬浮', usage: '' },
  'color-date-picker-range-input-input-wrapper-border-default': { value: 'transparent', category: 'color', label: '范围输入内框描边色', usage: '' },
  'color-date-picker-range-input-input-wrapper-bg-default': { value: 'transparent', category: 'color', label: '范围输入内框背景色', usage: '' },
  'color-date-picker-range-input-input-wrapper-bg-focus': { value: 'var(--cd-color-fill-1)', category: 'color', label: '范围输入内框背景色-聚焦', usage: '' },
  'color-date-picker-range-input-separator-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '范围分隔符文字色-激活', usage: '' },
  'color-date-picker-day-main-border': { value: 'var(--cd-color-primary-active)', category: 'color', label: '日期格子描边色', usage: '' },
  'color-date-picker-inset-input-separator': { value: 'var(--cd-color-text-3)', category: 'color', label: '内嵌输入分隔符色', usage: '' },
  'color-date-picker-range-trigger-border': { value: 'transparent', category: 'color', label: '范围触发器边框色', usage: '范围日期选择模式触发器边框颜色' },
  'color-date-picker-range-trigger-border-hover': { value: 'transparent', category: 'color', label: '范围触发器边框色-悬浮', usage: '范围日期选择模式触发器边框颜色 - 悬浮' },
  'color-date-picker-range-trigger-border-active': { value: 'transparent', category: 'color', label: '范围触发器边框色-激活', usage: '范围日期选择模式触发器边框颜色 - 激活' },
  'color-date-picker-range-trigger-border-focus': { value: 'transparent', category: 'color', label: '范围触发器边框色-聚焦', usage: '范围日期选择模式触发器边框颜色 - 聚焦' },

  // ============================ Font ============================
  'font-date-picker-range-input-prefix-suffix-clearbtn-font-weight': { value: '600', category: 'font', label: '范围输入前后缀清除按钮字重', usage: '' },
  'font-date-picker-preset-header-font-weight': { value: '600', category: 'font', label: '预设标题字重', usage: '' },
  'font-date-picker-range-input-prefix-suffix-clearbtn-font-size': { value: '14px', category: 'font', label: '范围输入前后缀清除按钮字号', usage: '' },
  'font-date-picker-range-input-prefix-suffix-clearbtn-line-height': { value: '20px', category: 'font', label: '范围输入前后缀清除按钮行高', usage: '' },
  'font-date-picker-range-input-large-font-size': { value: '16px', category: 'font', label: '范围输入大尺寸字号', usage: '' },

  // ============================ compact 变量 ============================
  'spacing-date-picker-month-compact-padding': { value: '10px', category: 'spacing', label: '紧凑月面板内边距', usage: '' },

  'width-date-picker-day-compact': { value: '28px', category: 'width', label: '紧凑日期格子尺寸', usage: '' },
  'width-date-picker-day-main-compact': { value: '24px', category: 'width', label: '紧凑日期格子内容尺寸', usage: '' },
  'width-date-picker-day-compact-border-radius': { value: '4px', category: 'radius', label: '紧凑日期格子圆角', usage: '' },
  'width-date-picker-month-compact': { value: 'calc(var(--cd-width-date-picker-day-compact) * 7 + var(--cd-spacing-date-picker-month-compact-padding) * 2)', category: 'width', label: '紧凑单月面板宽度', usage: '' },
  'width-date-picker-nav-compact': { value: '24px', category: 'width', label: '紧凑顶部导航栏高度', usage: '' },
  'width-date-picker-panel-compact': { value: '216px', category: 'width', label: '紧凑面板宽度', usage: '' },
  'height-date-picker-switch-compact': { value: '32px', category: 'height', label: '紧凑切换高度', usage: '' },
  'height-date-picker-tpk-compact': { value: '256px', category: 'height', label: '紧凑时间面板高度', usage: '' },
  'height-date-picker-yam-panel-compact': { value: '256px', category: 'height', label: '紧凑年月面板高度', usage: '' },
  'height-date-picker-yam-li-compact': { value: '32px', category: 'height', label: '紧凑年月列表项高度', usage: '' },
  'height-date-picker-yam-panel-header-compact': { value: '48px', category: 'height', label: '紧凑年月面板头部高度', usage: '' },
  'radius-date-picker-range-input-input-wrapper': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '范围输入内框圆角', usage: '' },
  'height-date-picker-range-input-default': { value: '32px', category: 'height', label: '范围输入高度-默认', usage: '' },
  'height-date-picker-range-input-small': { value: '24px', category: 'height', label: '范围输入高度-小', usage: '' },
  'height-date-picker-range-input-large': { value: '40px', category: 'height', label: '范围输入高度-大', usage: '' },
  'width-date-picker-inset-input-date-type-wrapper-compact': { value: '216px', category: 'width', label: '紧凑日期内嵌输入框宽度', usage: '' },
  'width-date-picker-inset-input-date-range-type-wrapper-compact': { value: 'calc(var(--cd-width-date-picker-inset-input-date-type-wrapper-compact) * 2)', category: 'width', label: '紧凑范围内嵌输入框宽度', usage: '' },
  'width-date-picker-inset-input-month-type-wrapper-compact': { value: '195px', category: 'width', label: '紧凑月份内嵌输入框宽度', usage: '' },
  'height-date-picker-inset-input-tpk-compact': { value: '100%', category: 'height', label: '紧凑内嵌时间面板高度', usage: '' },
  'height-date-picker-time-type-inset-input-yam-compact': { value: '100%', category: 'height', label: '紧凑内嵌年月时间面板高度', usage: '' },
  'height-date-picker-inset-input-wrapper-compact': { value: '28px', category: 'height', label: '紧凑内嵌输入外框高度', usage: '' },

  'line-height-date-picker-compact': { value: '20px', category: 'font', label: '紧凑行高', usage: '' },
  'line-height-date-picker-weekday-item-compact': { value: '28px', category: 'font', label: '紧凑星期项行高', usage: '' },
  // 注：Semi `$height-datepicker_insetInput_compact`（26px，camelCase）与下方
  // `$height-datepicker_inset_input_compact`（calc，snake_case）kebab 化后同名冲突，
  // 此项去连字符区分（insetinput）以避免键重复。
  'height-date-picker-insetinput-compact': { value: '26px', category: 'height', label: '紧凑内嵌输入高度', usage: '' },
  'font-size-date-picker-inset-input-compact-font-size': { value: '12px', category: 'font', label: '紧凑内嵌输入字号', usage: '' },

  'spacing-date-picker-switch-compact-padding': { value: '6px', category: 'spacing', label: '紧凑切换内边距', usage: '' },
  'spacing-date-picker-day-compact-margin': { value: 'calc((var(--cd-width-date-picker-day-compact) - var(--cd-width-date-picker-day-main-compact)) * 0.5)', category: 'spacing', label: '紧凑日期格子外边距', usage: '' },
  'spacing-date-picker-weeks-compact-padding': { value: '10px', category: 'spacing', label: '紧凑周内边距', usage: '' },
  'spacing-date-picker-weeks-compact-padding-top': { value: 'calc(var(--cd-spacing-tight) - 2px)', category: 'spacing', label: '紧凑周顶部内边距', usage: '' },
  'spacing-date-picker-weekday-compact-padding-left': { value: '10px', category: 'spacing', label: '紧凑星期左内边距', usage: '' },
  'spacing-date-picker-weekday-compact-padding-right': { value: '10px', category: 'spacing', label: '紧凑星期右内边距', usage: '' },
  'spacing-date-picker-weekday-compact-padding-bottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '紧凑星期底部内边距', usage: '' },
  'spacing-date-picker-compact-padding': { value: '12px', category: 'spacing', label: '紧凑内边距', usage: '' },
  'spacing-date-picker-nav-compact-padding': { value: '12px', category: 'spacing', label: '紧凑导航内边距', usage: '' },
  'spacing-date-picker-yam-panel-header-compact-padding': { value: '12px', category: 'spacing', label: '紧凑年月面板头部内边距', usage: '' },
  'spacing-date-picker-footer-compact-padding-top': { value: '10px', category: 'spacing', label: '紧凑 footer 顶部内边距', usage: '' },
  'spacing-date-picker-footer-compact-padding-bottom': { value: '10px', category: 'spacing', label: '紧凑 footer 底部内边距', usage: '' },
  'spacing-date-picker-footer-compact-padding-right': { value: '8px', category: 'spacing', label: '紧凑 footer 右内边距', usage: '' },
  'spacing-date-picker-scrolllist-shade-pre-compact-margin-top': { value: '-17px', category: 'spacing', label: '紧凑滚动列表前遮罩上外边距', usage: '' },
  'spacing-date-picker-scrolllist-shade-post-compact-margin-top': { value: '17px', category: 'spacing', label: '紧凑滚动列表后遮罩上外边距', usage: '' },
  'spacing-date-picker-inset-input-wrapper-compact-margin': { value: '4px', category: 'spacing', label: '紧凑内嵌输入外边距', usage: '' },
  'spacing-date-picker-inset-input-wrapper-compact-padding-y': { value: '8px', category: 'spacing', label: '紧凑内嵌输入垂直内边距', usage: '' },
  'spacing-date-picker-inset-input-wrapper-compact-padding-x': { value: '8px', category: 'spacing', label: '紧凑内嵌输入水平内边距', usage: '' },
  'spacing-date-picker-inset-input-wrapper-compact-padding-bottom': { value: '0', category: 'spacing', label: '紧凑内嵌输入底部内边距', usage: '' },
  'spacing-date-picker-inset-input-wrapper-range-type-compact-padding-top': { value: '0', category: 'spacing', label: '紧凑范围内嵌输入顶部内边距', usage: '' },
  'spacing-date-picker-quick-control-header-compact-padding-top': { value: '16px', category: 'spacing', label: '紧凑快捷面板标题上内边距', usage: 'compact, 快捷面板标题，上内边距' },
  'spacing-date-picker-quick-control-content-compact-margin-top': { value: '12px', category: 'spacing', label: '紧凑快捷面板内容上边距', usage: 'compact, 快捷面板内容，上边距' },
  'spacing-date-picker-quick-control-left-and-right-content-compact-padding-x': { value: '12px', category: 'spacing', label: '紧凑左右快捷面板内容左右内边距', usage: 'compact，左右方位，快捷面板内容，左右内边距' },
  'spacing-date-picker-quick-control-top-and-bottom-content-compact-padding-x': { value: '10px', category: 'spacing', label: '紧凑上下快捷面板内容左右内边距', usage: 'compact，上下方位，快捷面板内容，左右内边距' },

  // ============================ Radius ============================
  'radius-date-picker-range-input': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '范围输入圆角', usage: '' },

  // ============================ Other ============================
  'transition-date-picker-range-input': { value: 'background-color .16s ease-in-out', category: 'animation', label: '范围输入过渡', usage: '' },

  // ============================ preset calc ============================
  'width-date-picker-preset-panel-left-and-right-content': { value: 'calc(var(--cd-width-date-picker-preset-panel-left-and-right) - var(--cd-spacing-date-picker-quick-control-content-padding-x) * 2)', category: 'width', label: '左右快捷面板内容宽度', usage: '左右方位快捷选择面板，内容宽度' },
  'width-date-picker-preset-panel-top-and-bottom-content-date': { value: 'calc(var(--cd-width-date-picker-day) * 7 + var(--cd-spacing-date-picker-month-padding) * 2 - var(--cd-spacing-date-picker-quick-control-top-and-bottom-content-padding-x) * 2)', category: 'width', label: '上下快捷面板内容宽度-date', usage: 'date/dateTime下， 上下方位快捷选择面板内容宽度， 默认（284 - 40）px' },
  'width-date-picker-preset-panel-top-and-bottom-content-range': { value: 'calc((var(--cd-width-date-picker-day) * 7 + var(--cd-spacing-date-picker-month-padding) * 2) * 2 - var(--cd-spacing-date-picker-quick-control-top-and-bottom-content-padding-x) * 2)', category: 'width', label: '上下快捷面板内容宽度-range', usage: 'dateRange/dateTimeRange下， 上下方位快捷选择内容面板宽度，默认528px' },
  'width-date-picker-preset-panel-top-and-bottom-content-month': { value: 'calc(165px - var(--cd-spacing-date-picker-quick-control-top-and-bottom-content-padding-x) * 2)', category: 'width', label: '上下快捷面板内容宽度-month', usage: 'month下，上下方位快捷选择内容面板宽度， 默认154px' },

  'height-date-picker-month-max': { value: 'calc(var(--cd-width-date-picker-day) * 7 + 1px)', category: 'height', label: '年月面板最大高度', usage: '年月面板最大高度, 最多6 + 1行，再加上一个border宽度, 默认253px' },
  'height-date-picker-month-max-compact': { value: 'calc(var(--cd-width-date-picker-day-compact) * 7 + var(--cd-spacing-date-picker-weeks-compact-padding-top) + var(--cd-spacing-date-picker-weeks-compact-padding) + var(--cd-spacing-date-picker-weekday-compact-padding-bottom))', category: 'height', label: '紧凑年月面板最大高度', usage: '年月面板最大高度, 最多6 + 1行，再加上padding，默认220px' },
  'height-date-picker-date-panel': { value: 'calc(var(--cd-height-date-picker-month-max) + var(--cd-spacing-date-picker-month-padding) + var(--cd-width-date-picker-nav) + var(--cd-spacing-date-picker-navigation-padding-y) * 2)', category: 'height', label: 'date 面板渲染最大高度', usage: 'date/dateRange，面板渲染最大高度，默认325px' },
  'height-date-picker-date-time-panel': { value: 'calc(var(--cd-height-date-picker-date-panel) + var(--cd-height-date-picker-switch) - 1px)', category: 'height', label: 'dateTime 面板渲染最大高度', usage: 'dateTime/dateTImeRange 面板渲染最大高度. 默认378px' },
  'height-date-picker-preset-panel-left-and-right-except-content': { value: 'calc(20px + var(--cd-spacing-date-picker-quick-control-header-padding-top) + var(--cd-spacing-date-picker-quick-control-content-margin-top))', category: 'height', label: '左右快捷面板去除内容高度', usage: '除去content以外的高度，默认52px' },

  // compact
  'width-date-picker-preset-panel-top-and-bottom-content-date-compact': { value: 'calc(var(--cd-width-date-picker-day-compact) * 7 + var(--cd-spacing-date-picker-weeks-compact-padding) * 2 - var(--cd-spacing-date-picker-quick-control-top-and-bottom-content-compact-padding-x) * 2)', category: 'width', label: '紧凑上下快捷面板内容宽度-date', usage: 'date/dateTime下， 上下方位快捷选择面板内容宽度， 默认（216 - 20）px' },
  'width-date-picker-preset-panel-top-and-bottom-content-range-compact': { value: 'calc((var(--cd-width-date-picker-day-compact) * 7 + var(--cd-spacing-date-picker-weeks-compact-padding) * 2) * 2 - var(--cd-spacing-date-picker-quick-control-top-and-bottom-content-compact-padding-x) * 2)', category: 'width', label: '紧凑上下快捷面板内容宽度-range', usage: 'dateRange/dateTimeRange下， 上下方位快捷选择内容面板宽度，默认412px' },
  'width-date-picker-preset-panel-top-and-bottom-content-month-compact': { value: 'calc(165px - var(--cd-spacing-date-picker-quick-control-top-and-bottom-content-compact-padding-x) * 2)', category: 'width', label: '紧凑上下快捷面板内容宽度-month', usage: 'month下，上下方位快捷选择内容面板宽度， 默认174px' },

  'height-date-picker-date-panel-compact': { value: 'calc(var(--cd-height-date-picker-month-max-compact) + var(--cd-width-date-picker-nav-compact) + var(--cd-spacing-date-picker-nav-compact-padding))', category: 'height', label: '紧凑 date 面板渲染最大高度', usage: 'compact，date/dateRange，面板渲染最大高度，默认256px' },
  'height-date-picker-date-time-panel-compact': { value: 'calc(var(--cd-height-date-picker-date-panel-compact) + var(--cd-height-date-picker-switch-compact))', category: 'height', label: '紧凑 dateTime 面板渲染最大高度', usage: 'compact，dateTime/dateTImeRange，面板渲染最大高度，默认288px' },
  'height-date-picker-preset-panel-left-and-right-except-content-compact': { value: 'calc(20px + var(--cd-spacing-date-picker-quick-control-header-compact-padding-top) + var(--cd-spacing-date-picker-quick-control-content-compact-margin-top))', category: 'height', label: '紧凑左右快捷面板去除内容高度', usage: 'compact，除去content以外的高度，默认48px' },

  'width-date-picker-preset-panel-left-and-right-two-col-button': { value: 'calc((var(--cd-width-date-picker-preset-panel-left-and-right-content) - var(--cd-spacing-date-picker-quick-control-item-margin)) * 0.5)', category: 'width', label: '左右快捷面板两列按钮宽度', usage: '左右方位快捷选择面板，固定两列，按钮宽度' },
  'width-date-picker-preset-panel-top-and-bottom-three-col-button': { value: 'calc((var(--cd-width-date-picker-preset-panel-top-and-bottom-content-date) - var(--cd-spacing-date-picker-quick-control-item-margin) * 2) * 0.333)', category: 'width', label: '上下快捷面板三列按钮宽度', usage: '上下方位快捷选择面板，固定三列，按钮宽度' },
  'width-date-picker-preset-panel-top-and-bottom-five-col-button': { value: 'calc((var(--cd-width-date-picker-preset-panel-top-and-bottom-content-range) - var(--cd-spacing-date-picker-quick-control-item-margin) * 4) * 0.2)', category: 'width', label: '上下快捷面板五列按钮宽度', usage: '上下方位快捷选择面板，固定五列，按钮宽度' },
  'width-date-picker-preset-panel-top-and-bottom-two-col-button': { value: 'calc((var(--cd-width-date-picker-preset-panel-top-and-bottom-content-month) - var(--cd-spacing-date-picker-quick-control-item-margin)) * 0.5)', category: 'width', label: '上下快捷面板两列按钮宽度', usage: '上下方位快捷选择面板，固定两列，按钮宽度' },

  // compact
  'width-date-picker-preset-panel-top-and-bottom-three-col-button-compact': { value: 'calc((var(--cd-width-date-picker-preset-panel-top-and-bottom-content-date-compact) - var(--cd-spacing-date-picker-quick-control-item-margin) * 2) * 0.333)', category: 'width', label: '紧凑上下快捷面板三列按钮宽度', usage: '上下方位快捷选择面板，固定三列，按钮宽度' },
  'width-date-picker-preset-panel-top-and-bottom-five-col-button-compact': { value: 'calc((var(--cd-width-date-picker-preset-panel-top-and-bottom-content-range-compact) - var(--cd-spacing-date-picker-quick-control-item-margin) * 4) * 0.2)', category: 'width', label: '紧凑上下快捷面板五列按钮宽度', usage: '上下方位快捷选择面板，固定五列，按钮宽度' },
  'width-date-picker-preset-panel-top-and-bottom-two-col-button-compact': { value: 'calc((var(--cd-width-date-picker-preset-panel-top-and-bottom-content-month-compact) - var(--cd-spacing-date-picker-quick-control-item-margin)) * 0.5)', category: 'width', label: '紧凑上下快捷面板两列按钮宽度', usage: '上下方位快捷选择面板，固定两列，按钮宽度' },

  // insetinput
  'height-date-picker-inset-input': { value: 'calc(32px + var(--cd-spacing-date-picker-inset-input-wrapper-padding-y))', category: 'height', label: '内嵌输入高度', usage: '默认尺寸，insetInput高度' },
  'height-date-picker-preset-panel-inset-input': { value: 'calc(var(--cd-height-date-picker-month-max) + var(--cd-spacing-date-picker-month-padding) + var(--cd-width-date-picker-nav) + var(--cd-spacing-date-picker-navigation-inset-input-padding-y) * 2 + var(--cd-height-date-picker-inset-input))', category: 'height', label: '内嵌输入预设面板最大高度', usage: 'inset_input下，非month面板渲染最大高度，默认361px' },

  // insetinput compact
  'height-date-picker-inset-input-compact': { value: 'calc(28px + var(--cd-spacing-date-picker-inset-input-wrapper-compact-padding-y))', category: 'height', label: '紧凑内嵌输入高度', usage: 'compact，insetInput高度, 默认36px' },
  'height-date-picker-preset-panel-inset-input-compact': { value: 'calc(var(--cd-height-date-picker-month-max-compact) + var(--cd-width-date-picker-nav-compact) + var(--cd-spacing-date-picker-inset-input-wrapper-compact-padding-y) * 2 + var(--cd-height-date-picker-inset-input-compact))', category: 'height', label: '紧凑内嵌输入预设面板最大高度', usage: 'inset_input下，非month面板渲染最大高度，默认296px' },

  // ============================ 组件消费补充段（Semi 无独立变量；DatePicker/RangePicker.svelte 消费）============================
  // 老式裸值 token，升级为 TokenDef、原名原值保留，避免组件悬空。
  'date-picker-panel-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '面板背景色', usage: '日期面板背景色（组件消费）' },
  'date-picker-panel-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '面板阴影', usage: '日期面板阴影（组件消费）' },
  'date-picker-panel-radius': { value: 'var(--cd-border-radius-large)', category: 'radius', label: '面板圆角', usage: '日期面板圆角（组件消费）' },
  'date-picker-panel-z': { value: 'var(--cd-z-popover)', category: 'other', label: '面板层级', usage: '日期面板 z-index（组件消费）' },
  'date-picker-cell-size': { value: '32px', category: 'width', label: '日期格尺寸', usage: '日期格尺寸（组件消费）' },
  'date-picker-cell-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '日期格圆角', usage: 'Semi 日期格圆角 small（原 medium）（组件消费）' },
  'date-picker-cell-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '日期格悬浮背景色', usage: '日期格悬浮背景（组件消费）' },
  'date-picker-cell-bg-selected': { value: 'var(--cd-color-primary)', category: 'color', label: '日期格选中背景色', usage: '日期格选中背景（组件消费）' },
  'date-picker-cell-color-selected': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '日期格选中文字色', usage: '日期格选中文字（组件消费）' },
  'date-picker-cell-color-muted': { value: 'var(--cd-color-text-3)', category: 'color', label: '日期格弱化文字色', usage: '日期格弱化文字（组件消费）' },
  'date-picker-footer-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: 'footer 背景色', usage: 'Semi $color-datepicker_footer-bg-default（组件消费）' },
  'date-picker-quick-color': { value: 'var(--cd-color-primary)', category: 'color', label: '快捷操作文字色', usage: 'Semi 快捷操作按钮文字 primary（组件消费）' },
  'date-picker-header-color': { value: 'var(--cd-color-text-0)', category: 'color', label: 'header 文字色', usage: '日期面板 header 文字（组件消费）' },
  'date-picker-weekday-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '星期文字色', usage: '星期标题文字（组件消费）' },
} satisfies TokenGroup;
