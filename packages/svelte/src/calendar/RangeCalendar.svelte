<!--
  RangeCalendar — 多日（range）视图，对齐 Semi `semi-ui/calendar/rangeCalendar.tsx`。
  DOM：cd-calendar-week > week-sticky-top(header + week-header + all-day) + week-scroll-wrapper > week-scroll > (TimeCol + N×DayCol)。
  从 Calendar.svelte 的 mode==='range' 分支原样迁出，逻辑不变；本视图独立管理自己的响应式状态（不与其他视图共享 script 作用域）。
  对齐 Semi：weekCalendar.tsx 与 rangeCalendar.tsx 是完全独立重复实现，不共享代码，故本文件与 WeekCalendar.svelte 各自持有一份相同的 CSS，
  结构与 weekCalendar 几乎相同，只是列数由 range 决定（左闭右开 [start, end)）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    getDailyEvents,
    parseSpanEvents,
    allDayEventMap,
    calcRowHeight,
    parseEvents,
    addDaysLocal,
    differenceInCalendarDays,
    isSameDay,
    isWeekend,
    type CalendarEvent,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import TimeCol from './TimeCol.svelte';
  import DayCol from './DayCol.svelte';
  import type { RangeCalendarProps } from './types.js';

  let {
    displayValue,
    range,
    header,
    events = [],
    showCurrTime = true,
    scrollTop = 400,
    markWeekend = false,
    minEventHeight = Number.MIN_SAFE_INTEGER,
    width,
    height = 600,
    class: className,
    style,
    onClick,
    renderTimeDisplay,
    renderDateDisplay,
    dateGridRender,
    allDayEventsRender,
  }: RangeCalendarProps = $props();

  const loc = useLocale();

  // 展示锚点：纯受控 displayValue（缺省 today）。对齐 Semi——无内置导航。
  const fallbackAnchor = new Date();
  const anchor = $derived(displayValue ?? fallbackAnchor);

  // 当前时刻（红线用），每 30s 刷新一次。
  let now = $state(new Date());
  $effect(() => {
    if (!showCurrTime) return;
    const id = setInterval(() => {
      now = new Date();
    }, 30_000);
    return () => clearInterval(id);
  });

  // 滚动内容区像素高度：绝对定位事件的 top/height 需按它换算。
  let scrollContentHeight = $state(0);

  // 根滚动视口（对齐 Semi：dom 即根 .calendar-week，overflow:auto）。初始滚到 scrollTop 偏移
  // （对齐 Semi componentDidMount: dom.scrollTop = props.scrollTop）。
  let rootEl = $state<HTMLDivElement | null>(null);
  $effect(() => {
    if (!rootEl) return;
    rootEl.scrollTop = scrollTop;
  });

  // --- Intl 格式化器（语言来自 LocaleProvider 的 loc().code） ---
  const localeCode = $derived(loc().code);
  const weekdayFmt = $derived(new Intl.DateTimeFormat(localeCode, { weekday: 'short' }));
  const monthShortFmt = $derived(new Intl.DateTimeFormat(localeCode, { month: 'short' }));
  const fullDateFmt = $derived(
    new Intl.DateTimeFormat(localeCode, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }),
  );
  const slotTimeFmt = $derived(new Intl.DateTimeFormat(localeCode, { hour: '2-digit', minute: '2-digit' }));

  function dayString(d: Date): string {
    return String(d.getDate());
  }
  function weekdayName(d: Date): string {
    return weekdayFmt.format(d);
  }

  // --- 展示列（一列 = 一天，左闭右开 [range[0], range[1])） ---
  const columnDates = $derived.by<Date[]>(() => {
    if (!range) return [anchor];
    const n = Math.max(1, differenceInCalendarDays(range[1], range[0]));
    return Array.from({ length: n }, (_, i) => addDaysLocal(range[0], i));
  });

  // --- 全天/跨天事件桶 ---
  const allDayBucket = $derived(allDayEventMap(events));
  const spanEvents = $derived.by(() => {
    if (!range) return [];
    return parseSpanEvents(allDayBucket, range[0], range[1]);
  });
  const allDayRows = $derived(Math.max(1, calcRowHeight(spanEvents)));

  const dayBucket = $derived(parseEvents(events).day);
  function positionedDay(date: Date) {
    return getDailyEvents(dayBucket, date).day;
  }

  const eventByKey = $derived.by(() => {
    const m = new Map<CalendarEvent['key'], CalendarEvent>();
    for (const e of events) m.set(e.key, e);
    return m;
  });
  function origEvent(key: CalendarEvent['key'], children: unknown): CalendarEvent {
    return eventByKey.get(key) ?? ({ key, children } as CalendarEvent);
  }

  // 头部月份标签（对齐 Semi renderHeader 的 month = format(value,'LLL')）。
  const monthLabel = $derived(monthShortFmt.format(anchor));

  // --- 时间列文案（列本身在 TimeCol.svelte，对齐 Semi timeCol formatTime）---
  function hourLabel(h: number): string {
    // 对齐 Semi renderTime：`list.splice(0, 1, '')` 在 formatTime **之后**执行，
    // 故第 0 项恒为空串——renderTimeDisplay 也被它覆盖，判空必须先于自定义分支。
    if (h === 0) return '';
    if (renderTimeDisplay) {
      const v = renderTimeDisplay(h);
      return typeof v === 'string' ? v : String(v ?? '');
    }
    const isAM = h < 12;
    const time = h === 12 ? 12 : isAM ? h : h - 12;
    return loc().t(isAM ? 'Calendar.AM' : 'Calendar.PM', { time });
  }

  // --- 点击回调 ---
  function emitTimeClick(colDate: Date, halfIndex: number, e: Event) {
    const hour = Math.floor(halfIndex / 2);
    const minute = halfIndex % 2 === 0 ? 0 : 30;
    const d = new Date(colDate.getFullYear(), colDate.getMonth(), colDate.getDate(), hour, minute, 0, 0);
    onClick?.(e, d);
  }
  function slotLabel(colDate: Date, halfIndex: number): string {
    const hour = Math.floor(halfIndex / 2);
    const minute = halfIndex % 2 === 0 ? 0 : 30;
    const d = new Date(colDate.getFullYear(), colDate.getMonth(), colDate.getDate(), hour, minute);
    return `${fullDateFmt.format(colDate)} ${slotTimeFmt.format(d)}`;
  }

  function childrenIsSnippet(c: unknown): c is Snippet {
    return typeof c === 'function';
  }
  function childrenText(c: unknown): string {
    return typeof c === 'string' ? c : '';
  }

  // 全天条样式（对齐 Semi renderAllDayEvents：left/width%, top:${topInd}em）。
  function spanStyle(ev: (typeof spanEvents)[number]): string {
    return `left:${ev.leftPos * 100}%;width:${ev.width * 100}%;top:${ev.topInd}em;`;
  }

  const sizePx = (v: number | string | undefined) =>
    v === undefined ? undefined : typeof v === 'number' ? `${v}px` : v;

  // 根节点内联样式：对齐 Semi `{ height, width, ...style }`——用户 style 排在后面，可覆盖 height/width。
  const rootStyle = $derived.by(() => {
    const parts: string[] = [];
    const h = sizePx(height);
    const w = sizePx(width);
    if (h !== undefined) parts.push(`height:${h}`);
    if (w !== undefined) parts.push(`width:${w}`);
    if (style) parts.push(style.trim().replace(/;$/, ''));
    return parts.length ? `${parts.join(';')};` : undefined;
  });
</script>

{#snippet eventContent(ev: CalendarEvent)}
  {#if childrenIsSnippet(ev.children)}
    {@render (ev.children as Snippet)()}
  {:else}
    {childrenText(ev.children)}
  {/if}
{/snippet}

<!-- ===== range 视图（对齐 Semi rangeCalendar：结构同 weekCalendar，class 前缀仍为 cd-calendar-week；根无 role）===== -->
<div
  class={['cd-calendar-week', className]}
  bind:this={rootEl}
  style={`--cd-calendar-col-count:${columnDates.length};${rootStyle ?? ''}`}
>
  <div class="cd-calendar-week-sticky-top">
    {#if header}{@render header()}{/if}
    <!-- 日期表头（对齐 Semi weekCalendar.renderHeader：week-header 无 role，li 无 role；grid 有 role=gridcell） -->
    <div class="cd-calendar-week-header">
      <ul class="cd-calendar-tag cd-calendar-week-tag cd-calendar-week-sticky-left"><span>{monthLabel}</span></ul>
      <div class="cd-calendar-week-grid" role="gridcell">
        <ul class="cd-calendar-week-grid-row">
          {#each columnDates as d (d.getTime())}
            <li class:cd-calendar-today={isSameDay(d, now)} class:cd-calendar-weekend={markWeekend && isWeekend(d)}>
              {#if renderDateDisplay}
                {@render renderDateDisplay(d)}
              {:else}
                <span class="cd-calendar-today-date">{dayString(d)}</span>
                <span>{weekdayName(d)}</span>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    </div>
    <!-- 全天区（对齐 Semi renderAllDay：div.all-day > ul.tag.all-day-tag.sticky-left + div.all-day-content(calendar-content) > [skeleton] + ul.event-items） -->
    <div class="cd-calendar-all-day" style:height={allDayEventsRender ? undefined : `${allDayRows}em`}>
      <ul class="cd-calendar-tag cd-calendar-all-day-tag cd-calendar-week-sticky-left">
        <span>{loc().t('Calendar.allDay')}</span>
      </ul>
      <div class="cd-calendar-all-day-content cd-calendar-content" role="gridcell">
        <ul class="cd-calendar-all-day-skeleton">
          {#each columnDates as d (d.getTime())}
            <li class:cd-calendar-weekend={markWeekend && isWeekend(d)}></li>
          {/each}
        </ul>
        {#if allDayEventsRender}
          <!-- 对齐 Semi renderAllDayEvents：回传的是 props.events 全量事件，非解析后的全天桶 -->
          {@const rendered = allDayEventsRender(events)}
          {#if rendered}{@render rendered()}{/if}
        {:else}
          <ul class="cd-calendar-event-items">
            {#each spanEvents as ev (ev.key)}
              <li class="cd-calendar-event-item cd-calendar-event-allday" style={spanStyle(ev)}>
                {@render eventContent(origEvent(ev.key, ev.children))}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </div>
  <div class="cd-calendar-week-scroll-wrapper">
    <div class="cd-calendar-week-scroll" bind:clientHeight={scrollContentHeight}>
      <TimeCol {hourLabel} variant="week" />
      {#each columnDates as d (d.getTime())}
        <DayCol
          displayValue={d}
          dateLabel={fullDateFmt.format(d)}
          events={positionedDay(d)}
          scrollHeight={scrollContentHeight}
          {showCurrTime}
          isWeekend={markWeekend && isWeekend(d)}
          {minEventHeight}
          {dateGridRender}
          onSlotClick={emitTimeClick}
          {slotLabel}
          {eventContent}
          {origEvent}
          {now}
        />
      {/each}
    </div>
  </div>
</div>

<style>
  /* ul/li reset 用 :where() 保持 0 特异性，避免压过组件自身 class 的 padding（如 tag padding-right）。 */
  .cd-calendar-week :global(:where(ul, li)) {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  /* sticky 顶部（对齐 Semi -sticky-top：物理属性 top/left/right） */
  .cd-calendar-week-sticky-top {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: var(--cd-calendar-z-stickytop);
    background: var(--cd-calendar-color-sticky-bg);
  }

  /* 周末底色（对齐 Semi .calendar-weekend） */
  .cd-calendar-weekend {
    background: var(--cd-calendar-color-weekend-bg);
  }

  /* 对齐 Semi .calendar-week { overflow: auto; position: relative; display: grid }。 */
  .cd-calendar-week {
    overflow: auto;
    position: relative;
    display: grid;
  }

  /* sticky 左列（时间列 / tag 列，对齐 Semi -sticky-left：物理属性 left，RTL 单独覆盖） */
  .cd-calendar-week-sticky-left {
    position: sticky;
    left: 0;
    z-index: var(--cd-calendar-z-stickyleft);
    background: var(--cd-calendar-color-sticky-bg);
  }

  /* tag（月份 / 全天标签列）——逐字对齐 Semi .tag { font-size-regular; min-width:70px; color:day-text }。
     box-sizing:content-box 对齐 Semi（全局默认 content-box）：min-width 70 + padding-right 8 = 78，
     与 time 列（timeItems 70 + time padding 8 = 78）同宽，竖线对齐。文档站全局 border-box 会污染，故显式声明。 */
  .cd-calendar-tag {
    box-sizing: content-box;
    min-width: var(--cd-calendar-width-tag-col);
    color: var(--cd-calendar-color-day-text-default);
    font-size: var(--cd-font-size-regular);
  }
  /* 对齐 Semi .all-day .tag { text-align:right; padding-right:8px; span { line-height:26px } } */
  .cd-calendar-all-day-tag {
    text-align: right;
    padding-right: var(--cd-calendar-spacing-allday-tag-padding-right);
  }
  .cd-calendar-all-day-tag span {
    line-height: var(--cd-calendar-height-allday);
  }
  /* 对齐 Semi .week &-tag { text-align:right; line-height:26px; &:first-child { padding-right:8px } } */
  .cd-calendar-week-tag {
    text-align: right;
    line-height: var(--cd-calendar-height-allday);
    padding-right: var(--cd-calendar-spacing-tag-child-padding-right);
  }

  /* 全天区（对齐 Semi .all-day） */
  .cd-calendar-all-day {
    display: flex;
    flex: 1 1 auto;
    border-bottom: 1px solid var(--cd-calendar-color-day-border);
  }
  /* 对齐 Semi .calendar-week .all-day { font-size: $font-calendar_day_allDay-fontSize(26px) }：
     令全天区内 1em=26px，跨天条 top:${topInd}em 步长=26px、行高=26px，行与行不重叠。 */
  .cd-calendar-week .cd-calendar-all-day {
    font-size: var(--cd-calendar-font-day-allday-font-size);
  }
  .cd-calendar-all-day-content {
    position: relative;
    display: flex;
    flex: 1 0 auto;
    height: 100%;
    min-height: var(--cd-calendar-height-allday);
    min-width: calc(var(--cd-calendar-col-count, 1) * var(--cd-calendar-width-day-grid));
  }
  /* week 全天区列骨架（对齐 Semi .all-day-skeleton） */
  .cd-calendar-all-day-skeleton {
    display: flex;
    flex: 1 1 auto;
  }
  .cd-calendar-all-day-skeleton li {
    flex: 1 1 auto;
    min-width: var(--cd-calendar-width-day-grid);
    box-sizing: border-box;
    border-right: 1px solid var(--cd-calendar-color-day-border);
  }
  .cd-calendar-all-day-skeleton li:last-child {
    border-right: 1px solid transparent;
  }
  .cd-calendar-all-day .cd-calendar-event-items {
    position: absolute;
    left: 0;
    right: 0;
    width: 100%;
  }

  /* 滚动区容器高度（对齐 Semi -scroll-wrapper：100% - 表头/全天区高，约束滚动区不撑破容器） */
  .cd-calendar-week-scroll-wrapper {
    height: var(--cd-calendar-height-week-scroll-wrapper);
  }
  /* 滚动内容区（对齐 Semi -scroll：无自身 overflow，滚动由根 .calendar-week 承担） */
  .cd-calendar-week-scroll {
    display: flex;
    flex: 1 1 auto;
    position: relative;
    align-items: flex-start;
  }

  /* 事件容器（对齐 Semi .event-items { pointer-events:none; & > * { auto } .event-day {...} }） */
  .cd-calendar-event-items {
    pointer-events: none;
  }
  .cd-calendar-event-items > :global(*) {
    pointer-events: auto;
  }
  .cd-calendar-event-item {
    overflow: hidden;
  }
  /* 对齐 Semi .event-allday { position:absolute; & > * { font-size-regular } } */
  .cd-calendar-event-allday {
    position: absolute;
    height: var(--cd-calendar-height-allday);
  }
  .cd-calendar-event-allday > :global(*) {
    font-size: var(--cd-font-size-regular);
  }

  /* ============================ week 表头（对齐 Semi .calendar-week-header / -grid-row）============================ */
  .cd-calendar-week-header {
    display: flex;
    flex: 1 1 auto;
    align-items: flex-start;
    font-size: var(--cd-font-size-regular);
    color: var(--cd-calendar-color-day-text-default);
    border-bottom: 1px solid var(--cd-calendar-color-day-border);
  }
  .cd-calendar-week-grid {
    display: flex;
    flex: 1 0 auto;
    min-width: calc(var(--cd-calendar-col-count, 7) * var(--cd-calendar-width-day-grid));
  }
  .cd-calendar-week-grid-row {
    display: flex;
    flex: 1 0 auto;
  }
  .cd-calendar-week-grid-row li {
    display: flex;
    flex: 1 1 0;
    min-width: var(--cd-calendar-width-day-grid);
    border-right: 1px solid transparent;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    height: auto;
    line-height: var(--cd-calendar-height-allday);
  }
  .cd-calendar-week-grid-row li > :global(span) {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: var(--cd-calendar-height-allday);
  }
  /* 星期名 span（对齐 Semi li > span:last-child { padding: 0 4px }） */
  .cd-calendar-week-grid-row li > :global(span:last-child) {
    padding: 0 var(--cd-calendar-spacing-grid-row-span-child-padding-x);
  }
  /* today 日期圆标（对齐 Semi .today .today-date） */
  .cd-calendar-today .cd-calendar-today-date {
    width: var(--cd-calendar-width-today-date);
    height: var(--cd-calendar-width-today-date);
    line-height: var(--cd-calendar-width-today-date);
    text-align: center;
    border-radius: var(--cd-calendar-radius-today-date);
    background: var(--cd-calendar-color-bg-active);
    color: var(--cd-calendar-color-text-active);
  }

  /* —— RTL（逐条对齐 Semi calendar/rtl.scss）——
     本组件全部用物理属性（left/right/border-right 等，对齐 Semi calendar.scss），
     故 RTL 下逐条显式覆盖为镜像值，不依赖逻辑属性自动翻转。 */
  :global(.cd-rtl) .cd-calendar-week {
    direction: rtl;
  }
  :global(.cd-rtl) .cd-calendar-week-sticky-left {
    left: auto;
    right: 0;
  }
  :global(.cd-rtl) .cd-calendar-all-day-tag {
    text-align: left;
    padding-right: 0;
    padding-left: var(--cd-calendar-spacing-allday-tag-padding-right);
  }
  :global(.cd-rtl) .cd-calendar-week-tag {
    text-align: left;
    padding-right: 0;
    padding-left: var(--cd-calendar-spacing-tag-child-padding-right);
  }
  :global(.cd-rtl) .cd-calendar-all-day-skeleton li {
    border-right: 0;
    border-left: 1px solid var(--cd-calendar-color-day-border);
  }
  :global(.cd-rtl) .cd-calendar-all-day-skeleton li:last-child {
    border-left: 1px solid transparent;
  }
</style>
