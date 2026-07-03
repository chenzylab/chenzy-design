/**
 * Component tokens for Calendar（M4 Show）。全量对齐 Semi Design
 * （semi-foundation/calendar/variables.scss 94 个），并升级为带元数据的 TokenDef
 * 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Calendar.svelte 实际消费的补充 token（原名，Semi 无独立变量 /
 * 命名差异；组件消费）。
 *
 * 映射约定（逐条亲验 Semi variables.scss + 我们的 global/scales.ts + alias/index.ts）：
 * - Semi `$color-calendar[-_]xxx` → kebab `color-calendar-xxx`（`_` → `-`，camelCase → kebab）。
 * - Semi `var(--semi-color-*)` → 我们 `var(--cd-color-*)`（语义名一一对应）。
 * - Semi `var(--semi-border-radius-circle)` → 我们 `var(--cd-border-radius-circle)`。
 * - Semi 同文件 calc/嵌套引用 `$height-calendar_day_grid * 0.5` → 引用我们的 kebab 全名
 *   （含 category 前缀，因 build.ts 组件 token emit 为 `--cd-<key>`，key 已含 height-/width-/… 前缀）：
 *   `calc(var(--cd-height-calendar-day-grid) * 0.5)`。字面量（px / 0 / % / calc）忠实保留。
 * - Semi `$font-calendar_allDay_tag-lineHeight: $height-calendar_allDay` → 引用对应 height token。
 * - z-index / width / height / spacing / radius / font 分类照 Semi 语义归 category。
 * - usage 忠实照抄 Semi 中文注释。
 */
import type { TokenGroup } from './token-def.js';

export const calendarTokens = {
  // ============================ Color ============================
  'color-calendar-bg-active': { value: 'var(--cd-color-primary)', category: 'color', label: '今日标识颜色', usage: '今日标识颜色' },
  'color-calendar-bg': { value: 'var(--cd-color-bg-2)', category: 'color', label: '日历背景颜色', usage: '日历背景颜色' },
  'color-calendar-text-active': { value: 'var(--cd-color-bg-1)', category: 'color', label: '日历文字颜色 - 今日', usage: '日历文字颜色 - 今日' },
  'color-calendar-curr-bg': { value: 'var(--cd-color-danger)', category: 'color', label: '当前时间标识线颜色', usage: '当前时间标识线颜色' },
  'color-calendar-curr-border': { value: 'var(--cd-color-danger)', category: 'color', label: '当前时间标识线颜色', usage: '当前时间标识线颜色' },
  'color-calendar-curr-circle-bg-default': { value: 'var(--cd-color-danger)', category: 'color', label: '当前时间标识原点颜色', usage: '当前时间标识原点颜色' },
  'color-calendar-date-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '日历文字颜色 - 当月', usage: '日历文字颜色 - 当月' },
  'color-calendar-day-border': { value: 'var(--cd-color-border)', category: 'color', label: '日历描边颜色', usage: '日历描边颜色' },
  'color-calendar-day-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '日历文字颜色 - 非当月', usage: '日历文字颜色 - 非当月' },
  'color-calendar-sticky-bg': { value: 'var(--cd-color-bg-2)', category: 'color', label: '日历背景颜色 - 吸顶部分', usage: '日历背景颜色 - 吸顶部分' },
  'color-calendar-weekend-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '日历背景颜色 - 非工作日', usage: '日历背景颜色 - 非工作日' },

  // ============================ Width / Height ============================
  'width-calendar-day': { value: '70px', category: 'width', label: '天列宽', usage: '天列宽度' },
  'width-calendar-day-min-width': { value: '70px', category: 'width', label: '天列最小宽', usage: '天列最小宽度' },
  'height-calendar-day-grid': { value: '60px', category: 'height', label: '天时间格高', usage: '天视图时间格高度' },
  'width-calendar-day-grid': { value: '130px', category: 'width', label: '天时间格宽', usage: '天视图时间格宽度' },
  'width-calendar-day-grid-min-width': { value: '130px', category: 'width', label: '天时间格最小宽', usage: '天视图时间格最小宽度' },
  'height-calendar-time-grid': { value: 'calc(var(--cd-height-calendar-day-grid) * 0.5)', category: 'height', label: '时间格高', usage: '时间格高度（day-grid 的一半）' },
  'height-calendar-all-day': { value: '26px', category: 'height', label: '全天区高', usage: '全天事件区高度' },
  'height-calendar-all-day-min-height': { value: '26px', category: 'height', label: '全天区最小高', usage: '全天事件区最小高度' },
  'width-calendar-curr-circle': { value: '8px', category: 'width', label: '当前时间原点尺寸', usage: '当前时间标识原点尺寸' },
  'width-calendar-tag-col': { value: '70px', category: 'width', label: '标签列宽', usage: '标签列宽度' },
  'width-calendar-tag-col-min-width': { value: '70px', category: 'width', label: '标签列最小宽', usage: '标签列最小宽度' },
  'height-calendar-day-all-day': { value: '26px', category: 'height', label: '天视图全天区高', usage: '天视图全天区高度' },
  'height-calendar-month': { value: '100%', category: 'height', label: '月视图高', usage: '月视图高度' },
  'height-calendar-month-day': { value: '24px', category: 'height', label: '月视图日期格高', usage: '月视图日期格高度' },
  'height-calendar-month-week-skeletion': { value: '100%', category: 'height', label: '月视图周骨架高', usage: '月视图周骨架高度' },
  'height-calendar-month-grid-wrapper': { value: 'calc(100% - 27px)', category: 'height', label: '月视图网格容器高', usage: '月视图网格容器高度' },
  'width-calendar-card': { value: '220px', category: 'width', label: '事件卡片宽', usage: '事件卡片宽度' },
  'height-calendar-day-grid-time': { value: 'calc(var(--cd-height-calendar-day-grid) * 0.5)', category: 'height', label: '天视图时间格高', usage: '天视图时间格高度（day-grid 的一半）' },
  'width-calendar-today-date': { value: '24px', category: 'width', label: '今日日期标识宽', usage: '今日日期标识宽度' },
  'height-calendar-today-date': { value: '24px', category: 'height', label: '今日日期标识高', usage: '今日日期标识高度' },
  'height-calendar-body-li': { value: '24px', category: 'height', label: '内容列表项高', usage: '日历内容列表项高度' },
  'height-calendar-day-scroll-wrapper': { value: 'calc(100% - 28px)', category: 'height', label: '天视图滚动容器高', usage: '天视图滚动容器高度' },
  'height-calendar-week-scroll-wrapper': { value: 'calc(100% - 55px)', category: 'height', label: '周视图滚动容器高', usage: '周视图滚动容器高度' },
  'height-calendar-month-skeletion-li': { value: '100%', category: 'height', label: '月视图骨架项高', usage: '月视图骨架项高度' },
  'height-calendar-month-grid-col': { value: '100%', category: 'height', label: '月视图网格列高', usage: '月视图网格列高度' },
  'height-calendar-month-week-row-event-month': { value: '1em', category: 'height', label: '月视图周行事件高', usage: '月视图周行事件高度' },
  'width-calendar-border-default': { value: '1px', category: 'width', label: '描边默认宽', usage: '描边默认宽度' },
  'width-calendar-border-thick': { value: '1px', category: 'width', label: '描边加粗宽', usage: '描边加粗宽度' },

  // ============================ Spacing ============================
  'spacing-calendar-ul-li-padding': { value: '0', category: 'spacing', label: '列表项内边距', usage: '列表项内边距' },
  'spacing-calendar-ul-li-margin': { value: '0', category: 'spacing', label: '列表项外边距', usage: '列表项外边距' },
  'spacing-calendar-sticky-top-top': { value: '0', category: 'spacing', label: '吸顶 top', usage: '吸顶区域 top' },
  'spacing-calendar-sticky-top-right': { value: '0', category: 'spacing', label: '吸顶 right', usage: '吸顶区域 right' },
  'spacing-calendar-sticky-top-left': { value: '0', category: 'spacing', label: '吸顶 left', usage: '吸顶区域 left' },
  'spacing-calendar-sticky-left-left': { value: '0', category: 'spacing', label: '左吸附 left', usage: '左吸附区域 left' },
  'spacing-calendar-event-day-left': { value: '0', category: 'spacing', label: '天事件 left', usage: '天事件 left' },
  'spacing-calendar-event-day-right': { value: '0', category: 'spacing', label: '天事件 right', usage: '天事件 right' },
  'spacing-calendar-custom-container-top': { value: '0', category: 'spacing', label: '自定义容器 top', usage: '自定义容器 top' },
  'spacing-calendar-custom-container-right': { value: '0', category: 'spacing', label: '自定义容器 right', usage: '自定义容器 right' },
  'spacing-calendar-custom-container-bottom': { value: '0', category: 'spacing', label: '自定义容器 bottom', usage: '自定义容器 bottom' },
  'spacing-calendar-custom-container-left': { value: '0', category: 'spacing', label: '自定义容器 left', usage: '自定义容器 left' },
  'spacing-calendar-curr-circle-margin-top': { value: '-4px', category: 'spacing', label: '当前时间原点 marginTop', usage: '当前时间标识原点 marginTop' },
  'spacing-calendar-curr-line-left': { value: '0', category: 'spacing', label: '当前时间线 left', usage: '当前时间标识线 left' },
  'spacing-calendar-curr-line-right': { value: '0', category: 'spacing', label: '当前时间线 right', usage: '当前时间标识线 right' },
  'spacing-calendar-all-day-tag-padding-right': { value: '8px', category: 'spacing', label: '全天标签 paddingRight', usage: '全天标签 paddingRight' },
  'spacing-calendar-all-day-content-padding-left': { value: '0', category: 'spacing', label: '全天内容 paddingLeft', usage: '全天内容 paddingLeft' },
  'spacing-calendar-month-event-card-wrapper-padding-top': { value: '2px', category: 'spacing', label: '月视图事件卡容器 paddingTop', usage: '月视图事件卡容器 paddingTop' },
  'spacing-calendar-grid-row-span-child-padding-y': { value: '0', category: 'spacing', label: '网格跨行子项 paddingY', usage: '网格跨行子项纵向内边距' },
  'spacing-calendar-grid-row-span-child-padding-x': { value: '4px', category: 'spacing', label: '网格跨行子项 paddingX', usage: '网格跨行子项横向内边距' },
  'spacing-calendar-skeleton-li-child-padding-top': { value: '4px', category: 'spacing', label: '骨架列表子项 paddingTop', usage: '骨架列表子项 paddingTop' },
  'spacing-calendar-month-event-card-close-margin-right': { value: '-4px', category: 'spacing', label: '月视图事件卡关闭 marginRight', usage: '月视图事件卡关闭按钮 marginRight' },
  'spacing-calendar-header-info-date-margin-top': { value: '4px', category: 'spacing', label: '头部日期信息 marginTop', usage: '头部日期信息 marginTop' },
  'spacing-calendar-time-padding-right': { value: '8px', category: 'spacing', label: '时间 paddingRight', usage: '时间 paddingRight' },
  'spacing-calendar-time-item-span-top': { value: '-10px', category: 'spacing', label: '时间项 span top', usage: '时间项 span top' },
  'spacing-calendar-tag-child-padding-right': { value: '8px', category: 'spacing', label: '标签子项 paddingRight', usage: '标签子项 paddingRight' },
  'spacing-calendar-skeletion-grid-row-li-padding-right': { value: '8px', category: 'spacing', label: '骨架网格行项 paddingRight', usage: '骨架网格行列表项 paddingRight' },
  'spacing-calendar-month-event-card-wrapper-right': { value: '8px', category: 'spacing', label: '月视图事件卡容器 right', usage: '月视图事件卡容器 right' },
  'spacing-calendar-month-event-card-content-padding-y': { value: '12px', category: 'spacing', label: '月视图事件卡内容 paddingY', usage: '月视图事件卡内容纵向内边距' },
  'spacing-calendar-month-event-card-content-padding-x': { value: '0', category: 'spacing', label: '月视图事件卡内容 paddingX', usage: '月视图事件卡内容横向内边距' },
  'spacing-calendar-month-event-card-ul-li-margin': { value: '0', category: 'spacing', label: '月视图事件卡列表项 margin', usage: '月视图事件卡列表项外边距' },
  'spacing-calendar-month-event-card-ul-li-padding': { value: '0', category: 'spacing', label: '月视图事件卡列表项 padding', usage: '月视图事件卡列表项内边距' },
  'spacing-calendar-header-margin-y': { value: '12px', category: 'spacing', label: '头部 marginY', usage: '头部纵向外边距' },
  'spacing-calendar-header-margin-x': { value: '20px', category: 'spacing', label: '头部 marginX', usage: '头部横向外边距' },
  'spacing-calendar-body-pading-y': { value: '0', category: 'spacing', label: '内容 paddingY', usage: '内容纵向内边距' },
  'spacing-calendar-body-pading-x': { value: '16px', category: 'spacing', label: '内容 paddingX', usage: '内容横向内边距' },
  'spacing-calendar-event-items-top': { value: '31px', category: 'spacing', label: '事件项区 top', usage: '事件项区域 top' },
  'spacing-calendar-event-items-right': { value: '0', category: 'spacing', label: '事件项区 right', usage: '事件项区域 right' },
  'spacing-calendar-event-items-bottom': { value: '20px', category: 'spacing', label: '事件项区 bottom', usage: '事件项区域 bottom' },
  'spacing-calendar-event-items-left': { value: '0', category: 'spacing', label: '事件项区 left', usage: '事件项区域 left' },
  'spacing-calendar-month-skeletion-left': { value: '0', category: 'spacing', label: '月视图骨架 left', usage: '月视图骨架 left' },
  'spacing-calendar-month-skeletion-right': { value: '0', category: 'spacing', label: '月视图骨架 right', usage: '月视图骨架 right' },
  'spacing-calendar-month-date-right': { value: '4px', category: 'spacing', label: '月视图日期 right', usage: '月视图日期 right' },

  // ============================ Radius ============================
  'radius-calendar-curr-circle': { value: 'var(--cd-border-radius-circle)', category: 'radius', label: '当前时间原点圆角', usage: '日历选中日期标识圆角' },
  'radius-calendar-today-date': { value: 'var(--cd-border-radius-circle)', category: 'radius', label: '今日日期标识圆角', usage: '日历选中日期标识圆角' },

  // ============================ Font ============================
  'font-calendar-all-day-tag-line-height': { value: 'var(--cd-height-calendar-all-day)', category: 'font', label: '全天标签行高', usage: '日历全天标识文字行高' },
  'font-calendar-today-date-line-height': { value: '24px', category: 'font', label: '今日日期行高', usage: '今日日期文字行高' },
  'font-calendar-day-all-day-line-height': { value: '26px', category: 'font', label: '天视图全天行高', usage: '天视图全天文字行高' },
  'font-calendar-day-all-day-font-size': { value: '26px', category: 'font', label: '天视图全天字号', usage: '天视图全天文字字号' },
  'font-calendar-month-day-font-size': { value: '24px', category: 'font', label: '月视图日期字号', usage: '月视图日期文字字号' },

  // ============================ Other（z-index）============================
  'z-calendar-sticky-top': { value: '20', category: 'other', label: '吸顶层级', usage: '吸顶区域 z-index' },
  'z-calendar-item': { value: '5', category: 'other', label: '事件项层级', usage: '事件项 z-index' },
  'z-calendar-sticky-left': { value: '10', category: 'other', label: '左吸附层级', usage: '左吸附区域 z-index' },
  'z-calendar-curr': { value: '8', category: 'other', label: '当前时间层级', usage: '当前时间标识 z-index' },
  'z-calendar-line': { value: '3', category: 'other', label: '标识线层级', usage: '标识线 z-index' },

  // ============================ 组件消费补充段（Semi 无独立变量 / 命名差异；Calendar.svelte 消费）============================
  // 老式裸值 token，升级为 TokenDef、原名保留，值对齐 Semi 语义，避免组件悬空。
  'calendar-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '日历背景', usage: '日历整体背景（组件消费）' },
  'calendar-border': { value: 'var(--cd-color-border)', category: 'color', label: '日历描边', usage: 'Semi $color-calendar_day-border（组件消费）' },
  'calendar-header-bg': { value: 'var(--cd-color-bg-1)', category: 'color', label: '头部背景', usage: '工具栏 / 全天区背景（组件消费）' },
  'calendar-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '日历文字', usage: 'Semi $color-calendar_date-text-default（组件消费）' },
  'calendar-text-secondary': { value: 'var(--cd-color-text-2)', category: 'color', label: '日历次要文字', usage: 'Semi $color-calendar_day-text-default（星期 / 非当月 / 时间标签）（组件消费）' },
  'calendar-today-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '今日背景', usage: 'Semi $color-calendar-bg-active（今日实底 primary）（组件消费）' },
  'calendar-today-fg': { value: 'var(--cd-color-bg-1)', category: 'color', label: '今日文字', usage: 'Semi $color-calendar-text-active（今日浅字 bg-1）（组件消费）' },
  'calendar-selected-border': { value: 'var(--cd-color-primary)', category: 'color', label: '选中边框', usage: '选中日期边框高亮（组件消费）' },
  'calendar-range-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '范围区间背景', usage: 'range 区间内连续填充背景（组件消费）' },
  'calendar-range-edge-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '范围端点背景', usage: 'range 起止端点背景（组件消费）' },
  'calendar-week-cell-min-h': { value: '240px', category: 'height', label: '周视图格最小高', usage: 'week 模式单行日格最小高度（组件消费）' },
  'calendar-weekend-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '周末背景', usage: 'Semi $color-calendar_weekend-bg（周末列背景）（组件消费）' },
  'calendar-cell-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '日格悬浮背景', usage: '日格 / 事件块悬浮背景（组件消费）' },
  'calendar-event-default-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '事件默认色', usage: '事件竖条默认强调色（组件消费）' },
  'calendar-event-fg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '事件文字色', usage: '事件文字色（组件消费）' },
  'calendar-disabled-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '禁用背景', usage: '禁用日格背景 / 斜纹填充（组件消费）' },
  'calendar-more-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '更多按钮文字色', usage: '+N 折叠按钮文字色（组件消费）' },
  'calendar-cell-min-h': { value: '96px', category: 'height', label: '日格最小高', usage: 'month 模式日格最小高度（组件消费）' },
  'calendar-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '日历圆角', usage: '日历外框 / 日格 / 事件块圆角（组件消费）' },
  'calendar-hour-label-w': { value: '56px', category: 'width', label: '时间标签列宽', usage: 'day 视图小时标签 / 全天标签列宽（组件消费）' },
  'calendar-hour-min-h': { value: '40px', category: 'height', label: '小时行最小高', usage: 'day 视图每小时行最小高度（组件消费）' },
  'calendar-curr-time-color': { value: 'var(--cd-color-danger)', category: 'color', label: '当前时间线色', usage: 'Semi $color-calendar_curr-bg（当前时间红线 / 原点）（组件消费）' },
} satisfies TokenGroup;
