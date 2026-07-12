/**
 * Component tokens for Calendar — token 名逐字照搬 Semi `@douyinfe/semi-foundation/calendar/variables.scss`。
 * 规则：Semi `$<cat>-calendar_<rest>` → `calendar-<cat>-<rest>`
 *   （cat = color/width/height/spacing/z/radius；`_`→`-`；驼峰拆为小写连字符；保留 Semi 拼写与后缀，
 *    如 -default、skeletion、stickytop）。保留 cat 段以消除 Semi 中 $width-/$height- 同名冲突。
 * 名、值、作用 DOM 均与 Semi 一致；仅保留 Calendar.svelte 实际消费的变量。
 */
import type { TokenGroup } from './token-def.js';

export const calendarTokens = {
  // ============================ Color（$color-calendar_*）============================
  // $color-calendar-bg-active
  'calendar-color-bg-active': { value: 'var(--cd-color-primary)', category: 'color', label: '今日标识颜色', usage: 'Semi $color-calendar-bg-active（今日日期 .today-date 实底）' },
  // $color-calendar-bg
  'calendar-color-bg': { value: 'var(--cd-color-bg-2)', category: 'color', label: '日历背景颜色', usage: 'Semi $color-calendar-bg（时间列 .time-items 背景）' },
  // $color-calendar-text-active
  'calendar-color-text-active': { value: 'var(--cd-color-bg-1)', category: 'color', label: '今日文字颜色', usage: 'Semi $color-calendar-text-active（今日日期 .today-date 文字）' },
  // $color-calendar_curr-border
  'calendar-color-curr-border': { value: 'var(--cd-color-danger)', category: 'color', label: '当前时间线颜色', usage: 'Semi $color-calendar_curr-border（当前时间线 .grid-curr-line border）' },
  // $color-calendar_currCircle-bg-default
  'calendar-color-currcircle-bg-default': { value: 'var(--cd-color-danger)', category: 'color', label: '当前时间原点颜色', usage: 'Semi $color-calendar_currCircle-bg-default（当前时间原点 .grid-curr-circle 底）' },
  // $color-calendar_date-text-default
  'calendar-color-date-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '日历文字颜色（当月）', usage: 'Semi $color-calendar_date-text-default（当月日期 .month-same 文字）' },
  // $color-calendar_day-border
  'calendar-color-day-border': { value: 'var(--cd-color-border)', category: 'color', label: '日历描边颜色', usage: 'Semi $color-calendar_day-border（网格 / 时间轴描边）' },
  // $color-calendar_day-text-default
  'calendar-color-day-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '日历文字颜色（非当月 / 星期 / 时间标签）', usage: 'Semi $color-calendar_day-text-default（星期 / 时间列 / 非当月文字）' },
  // $color-calendar_sticky-bg
  'calendar-color-sticky-bg': { value: 'var(--cd-color-bg-2)', category: 'color', label: '日历吸顶背景颜色', usage: 'Semi $color-calendar_sticky-bg（.sticky-top / .sticky-left 背景）' },
  // $color-calendar_weekend-bg
  'calendar-color-weekend-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '日历周末背景颜色', usage: 'Semi $color-calendar_weekend-bg（.weekend 背景）' },

  // ============================ Width（$width-calendar_*）============================
  // $width-calendar_day_grid
  'calendar-width-day-grid': { value: '130px', category: 'width', label: '日列最小宽', usage: 'Semi $width-calendar_day_grid（.grid-content min-width）' },
  // $width-calendar_tag_col
  'calendar-width-tag-col': { value: '70px', category: 'width', label: '时间标签列宽', usage: 'Semi $width-calendar_tag_col（.time-items / tag min-width）' },
  // $width-calendar_currCircle
  'calendar-width-currcircle': { value: '8px', category: 'width', label: '当前时间原点直径', usage: 'Semi $width-calendar_currCircle（.grid-curr-circle 尺寸）' },
  // $width-calendar_today_date
  'calendar-width-today-date': { value: '24px', category: 'width', label: '今日日期标识宽', usage: 'Semi $width-calendar_today_date（.today-date 宽）' },
  // $width-calendar_card
  'calendar-width-card': { value: '220px', category: 'width', label: '事件卡片宽', usage: 'Semi $width-calendar_card（.month-event-card 宽）' },

  // ============================ Height（$height-calendar_*）============================
  // $height-calendar_day_grid
  'calendar-height-day-grid': { value: '60px', category: 'height', label: '整点行高', usage: 'Semi $height-calendar_day_grid（.time-item 整点行高）' },
  // $height-calendar_allDay
  'calendar-height-allday': { value: '26px', category: 'height', label: '全天区行高', usage: 'Semi $height-calendar_allDay（.all-day-content 行高 / 全天条高）' },
  // $height-calendar_today_date
  'calendar-height-today-date': { value: '24px', category: 'height', label: '今日日期标识高', usage: 'Semi $height-calendar_today_date（.today-date 高）' },
  // $height-calendar_month_day
  'calendar-height-month-day': { value: '24px', category: 'height', label: '月视图日期格高', usage: 'Semi $height-calendar_month_day（.month-date 数字格高）' },
  // $height-calendar_month_week_row_event_month
  'calendar-height-month-week-row-event-month': { value: '1em', category: 'height', label: '月视图跨天条行高', usage: 'Semi $height-calendar_month_week_row_event_month（.event-month 条高）' },
  // $height-calendar_day_scroll_wrapper（day 滚动区高 = 100% - 全天区高）
  'calendar-height-day-scroll-wrapper': { value: 'calc(100% - 28px)', category: 'height', label: 'day 滚动区高', usage: 'Semi $height-calendar_day_scroll_wrapper（.day-scroll-wrapper 高）' },
  // $height-calendar_week_scroll_wrapper（week 滚动区高 = 100% - 表头 - 全天区高）
  'calendar-height-week-scroll-wrapper': { value: 'calc(100% - 55px)', category: 'height', label: 'week 滚动区高', usage: 'Semi $height-calendar_week_scroll_wrapper（.week-scroll-wrapper 高）' },
  // $height-calendar_month_grid_wrapper（month 网格区高 = 100% - 星期表头高）
  'calendar-height-month-grid-wrapper': { value: 'calc(100% - 27px)', category: 'height', label: 'month 网格区高', usage: 'Semi $height-calendar_month_grid_wrapper（.month-grid-wrapper 高）' },
  // $spacing-calendar_event_items-top（月视图跨天条层顶偏移）
  'calendar-spacing-event-items-top': { value: '31px', category: 'spacing', label: '月视图事件层顶偏移', usage: 'Semi $spacing-calendar_event_items-top（.month .event-items top）' },
  // $spacing-calendar_event_items-bottom（月视图跨天条层底偏移）
  'calendar-spacing-event-items-bottom': { value: '20px', category: 'spacing', label: '月视图事件层底偏移', usage: 'Semi $spacing-calendar_event_items-bottom（.month .event-items bottom）' },

  // ============================ Font（对齐 Semi variables.scss Font 段）============================
  // $font-calendar_day_allDay-fontSize（全天区 font-size：令 1em=26px，使 top:${topInd}em 步长=行高不重叠）
  'calendar-font-day-allday-font-size': { value: '26px', category: 'other', label: '全天区字号（em 基准）', usage: 'Semi $font-calendar_day_allDay-fontSize（.week .all-day font-size，em=26px）' },

  // ============================ Radius（$radius-calendar_*）============================
  // $radius-calendar_today_date / $radius-calendar_currCircle
  'calendar-radius-today-date': { value: 'var(--cd-border-radius-circle)', category: 'radius', label: '今日日期圆角', usage: 'Semi $radius-calendar_today_date（.today-date / 原点圆角）' },

  // ============================ Spacing（$spacing-calendar_*）============================
  // $spacing-calendar_time-paddingRight
  'calendar-spacing-time-padding-right': { value: '8px', category: 'spacing', label: '时间列右间距', usage: 'Semi $spacing-calendar_time-paddingRight（.time 右 padding）' },
  // $spacing-calendar_time_item_span-top
  'calendar-spacing-time-item-span-top': { value: '-10px', category: 'spacing', label: '时间数字上移量', usage: 'Semi $spacing-calendar_time_item_span-top（.time-item span 上移）' },
  // $spacing-calendar_allDay_tag-paddingRight
  'calendar-spacing-allday-tag-padding-right': { value: '8px', category: 'spacing', label: '全天标签右间距', usage: 'Semi $spacing-calendar_allDay_tag-paddingRight（.all-day-tag 右 padding）' },
  // $spacing-calendar_tag_child-paddingRight
  'calendar-spacing-tag-child-padding-right': { value: '8px', category: 'spacing', label: '月份标签右间距', usage: 'Semi $spacing-calendar_tag_child-paddingRight（week tag 右 padding）' },
  // $spacing-calendar_grid_row_span_child-paddingX
  'calendar-spacing-grid-row-span-child-padding-x': { value: '4px', category: 'spacing', label: '星期名左右间距', usage: 'Semi $spacing-calendar_grid_row_span_child-paddingX（week 表头末 span 左右 padding）' },
  // $spacing-calendar_currCircle-marginTop
  'calendar-spacing-currcircle-margin-top': { value: '-4px', category: 'spacing', label: '当前时间原点上移量', usage: 'Semi $spacing-calendar_currCircle-marginTop（.grid-curr-circle 上移）' },
  // $spacing-calendar_skeleton_li_child-paddingTop
  'calendar-spacing-skeleton-li-child-padding-top': { value: '4px', category: 'spacing', label: '月视图日格顶间距', usage: 'Semi $spacing-calendar_skeleton_li_child-paddingTop（.month-skeleton li 顶 padding）' },
  // $spacing-calendar_skeletion_grid_row_li-paddingRight（保留 Semi 拼写 skeletion）
  'calendar-spacing-skeletion-grid-row-li-padding-right': { value: '8px', category: 'spacing', label: '月视图日格右间距', usage: 'Semi $spacing-calendar_skeletion_grid_row_li-paddingRight（月视图 li 右 padding）' },
  // $spacing-calendar_month_date-right
  'calendar-spacing-month-date-right': { value: '4px', category: 'spacing', label: '月视图日期数字右偏移', usage: 'Semi $spacing-calendar_month_date-right（.month-date 右偏移）' },
  // $spacing-calendar_month_event_card_wrapper-right
  'calendar-spacing-month-event-card-wrapper-right': { value: '8px', category: 'spacing', label: '「还有 N 项」右偏移', usage: 'Semi $spacing-calendar_month_event_card_wrapper-right（+N 文案右偏移）' },
  // $spacing-calendar_month_event_card_wrapper-paddingTop
  'calendar-spacing-month-event-card-wrapper-padding-top': { value: '2px', category: 'spacing', label: '「还有 N 项」顶间距', usage: 'Semi $spacing-calendar_month_event_card_wrapper-paddingTop（+N 文案顶 padding）' },
  // $spacing-calendar_header_info_date-marginTop
  'calendar-spacing-header-info-date-margin-top': { value: '4px', category: 'spacing', label: '卡片头日期上间距', usage: 'Semi $spacing-calendar_header_info_date-marginTop（+N 卡片头日期 marginTop）' },
  // $spacing-calendar_body-padingX（保留 Semi 拼写 pading）
  'calendar-spacing-body-pading-x': { value: '16px', category: 'spacing', label: '卡片体左右间距', usage: 'Semi $spacing-calendar_body-padingX（+N 卡片 body 左右 padding）' },

  // ============================ Z-index（$z-calendar_*）============================
  // $z-calendar_stickyTop
  'calendar-z-stickytop': { value: '20', category: 'other', label: '吸顶头部层级', usage: 'Semi $z-calendar_stickyTop（.sticky-top z-index）' },
  // $z-calendar_stickyLeft
  'calendar-z-stickyleft': { value: '10', category: 'other', label: '吸左列层级', usage: 'Semi $z-calendar_stickyLeft（.sticky-left z-index）' },
  // $z-calendar_curr
  'calendar-z-curr': { value: '8', category: 'other', label: '当前时间线层级', usage: 'Semi $z-calendar_curr（红线 / 原点 z-index）' },
  // $z-calendar_item
  'calendar-z-item': { value: '5', category: 'other', label: '事件条层级', usage: 'Semi $z-calendar_item（.event-day z-index）' },
  // $z-calendar_line
  'calendar-z-line': { value: '3', category: 'other', label: '横线 / 日期层级', usage: 'Semi $z-calendar_line（.row-line / .month-date z-index）' },
} satisfies TokenGroup;
