/**
 * Calendar Props 类型 — 对应 Semi 的 `semi-ui/calendar/interface.ts`。
 * Svelte 无 .tsx，用 types.ts 承载各视图组件的 Props 接口定义，供 Calendar.svelte /
 * DayCalendar.svelte / WeekCalendar.svelte / RangeCalendar.svelte / MonthCalendar.svelte /
 * DayCol.svelte / TimeCol.svelte 各自 import。
 *
 * 注：本仓库 tsconfig 开启 exactOptionalPropertyTypes，各视图组件把从 $props() 解构出的
 * `T | undefined` 变量原样透传给子组件时，属性类型必须显式包含 `| undefined`
 * （仅 `?:` 不够——那只表示「可省略」，不表示「可显式赋 undefined」）。
 */
import type { Snippet } from 'svelte';
import type { CalendarEvent, PositionedDayEvent, WeekStartsOn } from '@chenzy-design/core';
import type { CalendarMode } from './constants.js';

/** 完整 Props（对齐 Semi CalendarProps，公开 API 入口，由 Calendar.svelte 定义并透传）。 */
export interface CalendarProps {
  /** 展示锚点日期，默认 new Date() */
  displayValue?: Date | undefined;
  /** mode='range' 时必传，左闭右开 [start, end) */
  range?: [Date, Date] | undefined;
  /** 自定义头部内容（对齐 Semi header；缺省不渲染头部） */
  header?: Snippet | undefined;
  /** 事件列表 */
  events?: CalendarEvent[] | undefined;
  /** 视图模式，默认 'week' */
  mode?: CalendarMode | undefined;
  /** 显示当前时间红线（日/周/多日视图），默认 true */
  showCurrTime?: boolean | undefined;
  /** 周起始，默认 0（周日） */
  weekStartsOn?: WeekStartsOn | undefined;
  /** 日/周视图默认滚动高度（px），默认 400 */
  scrollTop?: number | undefined;
  /** 区分周末列（灰底），默认 false */
  markWeekend?: boolean | undefined;
  /** 日/周/多日视图事件最小高度（px），默认 Number.MIN_SAFE_INTEGER */
  minEventHeight?: number | undefined;
  /** 日历整体宽度 */
  width?: number | string | undefined;
  /** 日历整体高度，默认 600 */
  height?: number | string | undefined;
  /** 根节点自定义类名（对齐 Semi className） */
  class?: string | undefined;
  /** 根节点内联样式（对齐 Semi style：合并在 height/width 之后，可覆盖二者） */
  style?: string | undefined;
  /** 点击日期格（对齐 Semi function(e, date)）：日/周视图精确到半小时，月视图精确到日 */
  onClick?: ((e: Event, date: Date) => void) | undefined;
  /** 月视图 +N 卡片关闭回调（对齐 Semi function(e)） */
  onClose?: ((e: Event) => void) | undefined;
  /** 月视图点「还有 N 项」回调（对齐 Semi function(e, date, remaining)） */
  onMoreClick?: ((e: Event, date: Date, remaining: number) => void) | undefined;
  /** 自定义日/周视图时间文案 */
  renderTimeDisplay?: ((hour: number) => unknown) | undefined;
  /** 自定义日期文案（week/range 视图日期头）。对齐 Semi renderDateDisplay(date)=>ReactNode。 */
  renderDateDisplay?: Snippet<[Date]> | undefined;
  /** 自定义单元格/列（绝对定位）；返回 Snippet 覆盖默认渲染 */
  dateGridRender?: ((dateString: string, date: Date) => Snippet | null | undefined) | undefined;
  /** 自定义顶部全天区；返回 Snippet 覆盖默认全天渲染 */
  allDayEventsRender?: ((events: CalendarEvent[]) => Snippet | null | undefined) | undefined;
}

/** day 视图 Props（对齐 Semi DayCalendarProps = Omit<CalendarProps, 'range'>）。 */
export type DayCalendarProps = Omit<CalendarProps, 'range'>;

/** week 视图 Props（对齐 Semi WeekCalendarProps = Omit<CalendarProps, 'range'>）。 */
export type WeekCalendarProps = Omit<CalendarProps, 'range'>;

/** range 视图 Props（对齐 Semi RangeCalendarProps；range 缺省时退化为单日列，锚点取 displayValue）。 */
export type RangeCalendarProps = CalendarProps;

/** month 视图 Props（对齐 Semi MonthCalendarProps = Omit<CalendarProps, 'range' | 'showCurrTime' | 'scrollTop' | 'renderTimeDisplay'>）。 */
export type MonthCalendarProps = Omit<CalendarProps, 'range' | 'showCurrTime' | 'scrollTop' | 'renderTimeDisplay'>;

/** DayCol Props（对齐 Semi dayCol.tsx DayColProps）：day/week/range 共用的单日列组件。 */
export interface DayColProps {
  /** 该列展示日期 */
  displayValue: Date;
  /** 该列 grid-content 的 aria-label（完整日期文案，对齐 Semi fullDateFmt） */
  dateLabel: string;
  /** 该列的已定位事件（day bucket，来自 core getDailyEvents） */
  events: PositionedDayEvent[];
  /** 滚动内容区像素高度（事件 top/height 换算基准） */
  scrollHeight: number;
  /** 是否显示当前时间红线（列本身是否为「今天」由内部按 now 判断） */
  showCurrTime?: boolean | undefined;
  /** 周末列（灰底） */
  isWeekend?: boolean | undefined;
  /** 事件最小高度（px） */
  minEventHeight?: number | undefined;
  /** 自定义单元格/列（绝对定位）；返回 Snippet 覆盖默认渲染 */
  dateGridRender?: ((dateString: string, date: Date) => Snippet | null | undefined) | undefined;
  /** 半小时格点击回调（halfIndex：当天第几个半小时，0~49） */
  onSlotClick?: ((colDate: Date, halfIndex: number, e: Event) => void) | undefined;
  /** 半小时格 aria-label（colDate, halfIndex）=> 文案 */
  slotLabel: (colDate: Date, halfIndex: number) => string;
  /** 事件内容渲染（对齐 Semi event.children：字符串直出 / snippet render） */
  eventContent: Snippet<[CalendarEvent]>;
  /** 按 key 查回原始事件（core 定位结果只保留 key/children，需要按 key 补全字段） */
  origEvent: (key: CalendarEvent['key'], children: unknown) => CalendarEvent;
  /** 当前时刻（判断本列是否为「今天」+ 红线位置换算，由父组件统一维护并下发，避免每列各自起 setInterval） */
  now: Date;
}

/** TimeCol Props（对齐 Semi timeCol.tsx TimeColProps）。 */
export interface TimeColProps {
  /** 每小时的展示文案（由父组件按 locale / renderTimeDisplay 计算） */
  hourLabel: (hour: number) => string;
  /** 所属视图：week/range 与 day 的 sticky-left class 前缀不同（对齐 Semi） */
  variant: 'day' | 'week';
}
