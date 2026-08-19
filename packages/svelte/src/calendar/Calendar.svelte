<!--
  Calendar — 纯事件展示日历，路由外壳，对齐 Semi Design `semi-ui/calendar/index.tsx`。
  按 mode prop 选择渲染 DayCalendar/WeekCalendar/MonthCalendar/RangeCalendar 之一，把 props 透传下去。
  这是包的对外导出入口（index.ts 的 `export { default as Calendar }` 指向本文件），公开 Props 接口定义在此。
  DOM 结构与 class 名完全照搬 Semi Design Calendar（semi-calendar → cd-calendar），详见各子视图组件：
   - day：cd-calendar-day(overflow:auto) > day-sticky-top(header + all-day) + day-scroll-wrapper > day-scroll > (time + grid)
   - week/range：cd-calendar-week > week-sticky-top(header + week-header + all-day) + week-scroll-wrapper > week-scroll > (time + N×grid)
   - month：cd-calendar-month > month-sticky-top(header + month-header) + month-grid-wrapper > month-week > grid-col > N×month-weekrow
  displayValue 决定展示锚点；onClick 回调点击的精确时间点（日/周精确到半小时，月精确到日）。
  事件定位全部来自 @chenzy-design/core 的纯算法；事件内容由 event.children 承载（字符串直出 / snippet @render），对齐 Semi children。
  头部对齐 Semi：无默认导航，仅当传入 header snippet 时渲染自定义头部。
-->
<script lang="ts">
  import type { CalendarProps } from './types.js';
  import DayCalendar from './DayCalendar.svelte';
  import WeekCalendar from './WeekCalendar.svelte';
  import RangeCalendar from './RangeCalendar.svelte';
  import MonthCalendar from './MonthCalendar.svelte';

  let {
    displayValue,
    range,
    header,
    events = [],
    mode = 'week',
    showCurrTime = true,
    weekStartsOn = 0,
    scrollTop = 400,
    markWeekend = false,
    minEventHeight = Number.MIN_SAFE_INTEGER,
    width,
    height = 600,
    class: className,
    style,
    onClick,
    onClose,
    onMoreClick,
    renderTimeDisplay,
    renderDateDisplay,
    dateGridRender,
    allDayEventsRender,
  }: CalendarProps = $props();
</script>

{#if mode === 'day'}
  <DayCalendar
    {displayValue}
    {header}
    {events}
    {showCurrTime}
    {scrollTop}
    {markWeekend}
    {minEventHeight}
    {width}
    {height}
    class={className}
    {style}
    {onClick}
    {renderTimeDisplay}
    {dateGridRender}
    {allDayEventsRender}
  />
{:else if mode === 'range'}
  <RangeCalendar
    {displayValue}
    {range}
    {header}
    {events}
    {showCurrTime}
    {scrollTop}
    {markWeekend}
    {minEventHeight}
    {width}
    {height}
    class={className}
    {style}
    {onClick}
    {renderTimeDisplay}
    {renderDateDisplay}
    {dateGridRender}
    {allDayEventsRender}
  />
{:else if mode === 'month'}
  <MonthCalendar
    {displayValue}
    {header}
    {events}
    {weekStartsOn}
    {markWeekend}
    {width}
    {height}
    class={className}
    {style}
    {onClick}
    {onClose}
    {onMoreClick}
    {renderDateDisplay}
    {dateGridRender}
  />
{:else}
  <WeekCalendar
    {displayValue}
    {header}
    {events}
    {showCurrTime}
    {weekStartsOn}
    {scrollTop}
    {markWeekend}
    {minEventHeight}
    {width}
    {height}
    class={className}
    {style}
    {onClick}
    {renderTimeDisplay}
    {renderDateDisplay}
    {dateGridRender}
    {allDayEventsRender}
  />
{/if}
