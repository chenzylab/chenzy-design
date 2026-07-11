/**
 * Machine-readable component metadata for AI/docs consumption.
 * Calendar — 纯事件展示日历，对齐 Semi Design Calendar 契约。
 */
export const meta = {
  name: 'Calendar',
  category: 'show',
  description:
    '纯事件展示日历，对齐 Semi Design Calendar。四视图 mode=day/week/month/range：day 单日时间轴（左时间列 + 单日列，25×2 半小时可点击格 + 绝对定位事件）；week 星期表头 + 7 列 DayCol，跨天事件走顶部全天区（parseWeekSpanEvents）；range 结构同 week，列数=range 天数（左闭右开），跨天走 parseSpanEvents；month 6×7 网格，跨天条走 getMonthEvents，每格超额显示「还有 N 项」并用 Popover 弹卡片。displayValue 决定展示锚点；onClick 回调点击的精确时间点（日/周精确到半小时，月精确到日）。showCurrTime 当前时间红线（当天列，每 30s 刷新）。事件定位全部来自 @chenzy-design/core 纯算法（getDailyEvents/parseWeekSpanEvents/parseSpanEvents/getMonthEvents/calcRowHeight/allDayEventMap/getPos），本组件只把数值位置转成内联样式。事件外观由 event.children 承载（字符串直出 / snippet render），对齐 Semi children。头部对齐 Semi：无默认导航，仅当传入 header 时渲染自定义头部。',
  exports: ['Calendar'],
  props: [
    { name: 'displayValue', type: 'Date', default: 'new Date()', desc: '展示锚点日期（决定展示的天/周/月）' },
    { name: 'range', type: '[Date, Date]', default: 'undefined', desc: "mode='range' 时必传，左闭右开 [start, end)" },
    { name: 'header', type: 'Snippet', default: 'undefined', desc: '自定义头部内容（对齐 Semi header；缺省不渲染头部）' },
    { name: 'events', type: 'CalendarEvent[]', default: '[]', desc: '事件列表（key 必填且唯一）' },
    { name: 'mode', type: "'day' | 'week' | 'month' | 'range'", default: "'week'", desc: '视图模式' },
    { name: 'showCurrTime', type: 'boolean', default: 'true', desc: '显示当前时间红线（日/周/多日视图，当天列）' },
    { name: 'weekStartsOn', type: '0|1|2|3|4|5|6', default: '0', desc: '一周起始(0=周日)' },
    { name: 'scrollTop', type: 'number', default: '400', desc: '日/周视图默认滚动区高度（px）' },
    { name: 'markWeekend', type: 'boolean', default: 'false', desc: '区分周末列（灰底）' },
    {
      name: 'minEventHeight',
      type: 'number',
      default: 'Number.MIN_SAFE_INTEGER',
      desc: '日/周/多日视图事件块最小高度（px）',
    },
    { name: 'width', type: 'number | string', default: 'undefined', desc: '日历整体宽度' },
    { name: 'height', type: 'number | string', default: '600', desc: '日历整体高度' },
    {
      name: 'onClick',
      type: '(e: Event, date: Date) => void',
      default: 'undefined',
      desc: '点击日期格（对齐 Semi function(e, date)）：日/周视图精确到半小时，月视图精确到日',
    },
    {
      name: 'onClose',
      type: '(e: Event) => void',
      default: 'undefined',
      desc: '月视图 +N 卡片关闭回调（对齐 Semi function(e)）',
    },
    {
      name: 'onMoreClick',
      type: '(e: Event, date: Date, remaining: number) => void',
      default: 'undefined',
      desc: '月视图点「还有 N 项」回调（对齐 Semi function(e, date, remaining)）',
    },
    {
      name: 'renderTimeDisplay',
      type: '(hour: number) => unknown',
      default: 'undefined',
      desc: '自定义日/周视图时间文案（返回字符串即可）',
    },
    {
      name: 'renderDateDisplay',
      type: 'Snippet<[Date]>',
      default: 'undefined',
      desc: '自定义 week/range 视图日期表头（接收 date 的 Snippet，对齐 Semi ReactNode）',
    },
    {
      name: 'dateGridRender',
      type: '(dateString: string, date: Date) => Snippet | null | undefined',
      default: 'undefined',
      desc: '自定义单元格/列额外内容（dateString = date.toString()，对齐 Semi）',
    },
    {
      name: 'allDayEventsRender',
      type: '(events: CalendarEvent[]) => Snippet | null | undefined',
      default: 'undefined',
      desc: '自定义顶部全天区渲染',
    },
  ],
  events: [
    { name: 'onClick', desc: '点击日期格（日/周半小时、月日）' },
    { name: 'onMoreClick', desc: '月视图点「还有 N 项」' },
    { name: 'onClose', desc: '月视图 +N 卡片关闭' },
  ],
  slots: [
    { name: 'header', desc: '自定义头部内容（对齐 Semi header）' },
  ],
  a11y: {
    hasRole: true,
    focusable: true,
    note: '根容器 role=grid + aria-label（取标题）。时间轴视图每列 role=gridcell（含 aria-label 日期），半小时格为 <button>（aria-label=日期+时:分）。week/range 视图有日期表头 role=columnheader（day 视图对齐 Semi 无列头）。month 视图：星期表头 role=columnheader，日格 role=gridcell，today 格 aria-current=date，日格可点击（Enter/Space）。月视图「还有 N 项」用 Popover（trigger=click，showCloseButton，title=日期），关闭回调 onClose。',
  },
  tokens: [
    // color（$color-calendar_*）
    '--cd-calendar-color-bg',
    '--cd-calendar-color-bg-active',
    '--cd-calendar-color-text-active',
    '--cd-calendar-color-curr-border',
    '--cd-calendar-color-currcircle-bg-default',
    '--cd-calendar-color-date-text-default',
    '--cd-calendar-color-day-border',
    '--cd-calendar-color-day-text-default',
    '--cd-calendar-color-sticky-bg',
    '--cd-calendar-color-weekend-bg',
    // width（$width-calendar_*）
    '--cd-calendar-width-day-grid',
    '--cd-calendar-width-tag-col',
    '--cd-calendar-width-currcircle',
    '--cd-calendar-width-today-date',
    '--cd-calendar-width-card',
    // height（$height-calendar_*）
    '--cd-calendar-height-day-grid',
    '--cd-calendar-height-allday',
    '--cd-calendar-height-today-date',
    '--cd-calendar-height-month-day',
    '--cd-calendar-height-month-week-row-event-month',
    // radius（$radius-calendar_*）
    '--cd-calendar-radius-today-date',
    // spacing（$spacing-calendar_*）
    '--cd-calendar-spacing-time-padding-right',
    '--cd-calendar-spacing-time-item-span-top',
    '--cd-calendar-spacing-allday-tag-padding-right',
    '--cd-calendar-spacing-tag-child-padding-right',
    '--cd-calendar-spacing-grid-row-span-child-padding-x',
    '--cd-calendar-spacing-currcircle-margin-top',
    '--cd-calendar-spacing-skeleton-li-child-padding-top',
    '--cd-calendar-spacing-skeletion-grid-row-li-padding-right',
    '--cd-calendar-spacing-month-date-right',
    '--cd-calendar-spacing-month-event-card-wrapper-right',
    '--cd-calendar-spacing-month-event-card-wrapper-padding-top',
    '--cd-calendar-spacing-header-info-date-margin-top',
    '--cd-calendar-spacing-body-pading-x',
    // z-index（$z-calendar_*）
    '--cd-calendar-z-stickytop',
    '--cd-calendar-z-stickyleft',
    '--cd-calendar-z-curr',
    '--cd-calendar-z-item',
    '--cd-calendar-z-line',
    // 基础层 token
    '--cd-color-bg-2',
    '--cd-font-size-regular',
    '--cd-font-size-small',
    '--cd-font-size-header',
    '--cd-focus-ring',
    '--cd-spacing-extra-tight',
    '--cd-border-radius-medium',
    '--cd-border-radius-small',
  ],
  responsive: false,
  examples: [
    { title: '基础周视图', code: '<Calendar />' },
    {
      title: '带事件',
      code: '<Calendar events={[{ key: 1, start: new Date(), children: "会议" }]} />',
    },
    { title: '月视图', code: '<Calendar mode="month" />' },
    {
      title: '日视图（单日时间轴）',
      code: '<Calendar mode="day" events={[{ key: 1, start: new Date(), children: "会议" }]} />',
    },
    {
      title: '多日视图（range）',
      code: '<Calendar mode="range" range={[start, end]} />',
    },
    {
      title: '点击回调',
      code: '<Calendar onClick={(e, date) => console.log(date)} />',
    },
  ],
} as const;
