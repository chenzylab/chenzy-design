<!--
  Calendar — 纯事件展示日历，DOM 结构与 class 名完全照搬 Semi Design Calendar（semi-calendar → cd-calendar）。
  四视图 mode='day'|'week'|'month'|'range'，分别对齐 Semi 的 dayCalendar/weekCalendar/monthCalendar/rangeCalendar：
   - day：cd-calendar-day(overflow:auto) > day-sticky-top(header + all-day) + day-scroll-wrapper > day-scroll > (time + grid)
   - week/range：cd-calendar-week > week-sticky-top(header + week-header + all-day) + week-scroll-wrapper > week-scroll > (time + N×grid)
   - month：cd-calendar-month > month-sticky-top(header + month-header) + month-grid-wrapper > month-week > grid-col > N×month-weekrow
  displayValue 决定展示锚点；onClick 回调点击的精确时间点（日/周精确到半小时，月精确到日）。
  事件定位全部来自 @chenzy-design/core 的纯算法；事件内容由 event.children 承载（字符串直出 / snippet @render），对齐 Semi children。
  头部对齐 Semi：无默认导航，仅当传入 header snippet 时渲染自定义头部。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    getDailyEvents,
    parseWeekSpanEvents,
    parseSpanEvents,
    allDayEventMap,
    calcRowHeight,
    getMonthEvents,
    parseEvents,
    startOfWeek,
    addDaysLocal,
    differenceInCalendarDays,
    isSameDay,
    isSameMonth,
    isWeekend,
    getPos,
    getMonthGrid,
    weekdayOrder,
    type CalendarEvent,
    type PositionedDayEvent,
    type PositionedSpanEvent,
    type WeekStartsOn,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { Popover } from '../popover/index.js';

  type Mode = 'day' | 'week' | 'month' | 'range';

  interface Props {
    /** 展示锚点日期，默认 new Date() */
    displayValue?: Date;
    /** mode='range' 时必传，左闭右开 [start, end) */
    range?: [Date, Date];
    /** 自定义头部内容（对齐 Semi header；缺省不渲染头部） */
    header?: Snippet;
    /** 事件列表 */
    events?: CalendarEvent[];
    /** 视图模式，默认 'week' */
    mode?: Mode;
    /** 显示当前时间红线（日/周/多日视图），默认 true */
    showCurrTime?: boolean;
    /** 周起始，默认 0（周日） */
    weekStartsOn?: WeekStartsOn;
    /** 日/周视图默认滚动高度（px），默认 400 */
    scrollTop?: number;
    /** 区分周末列（灰底），默认 false */
    markWeekend?: boolean;
    /** 日/周/多日视图事件最小高度（px），默认 Number.MIN_SAFE_INTEGER */
    minEventHeight?: number;
    /** 日历整体宽度 */
    width?: number | string;
    /** 日历整体高度，默认 600 */
    height?: number | string;
    /** 点击日期格（对齐 Semi function(e, date)）：日/周视图精确到半小时，月视图精确到日 */
    onClick?: (e: Event, date: Date) => void;
    /** 月视图 +N 卡片关闭回调（对齐 Semi function(e)） */
    onClose?: (e: Event) => void;
    /** 月视图点「还有 N 项」回调（对齐 Semi function(e, date, remaining)） */
    onMoreClick?: (e: Event, date: Date, remaining: number) => void;
    /** 自定义日/周视图时间文案 */
    renderTimeDisplay?: (hour: number) => unknown;
    /** 自定义日期文案（week/range 视图日期头）。对齐 Semi renderDateDisplay(date)=>ReactNode。 */
    renderDateDisplay?: Snippet<[Date]>;
    /** 自定义单元格/列（绝对定位）；返回 Snippet 覆盖默认渲染 */
    dateGridRender?: (dateString: string, date: Date) => Snippet | null | undefined;
    /** 自定义顶部全天区；返回 Snippet 覆盖默认全天渲染 */
    allDayEventsRender?: (events: CalendarEvent[]) => Snippet | null | undefined;
  }

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
    onClick,
    onClose,
    onMoreClick,
    renderTimeDisplay,
    renderDateDisplay,
    dateGridRender,
    allDayEventsRender,
  }: Props = $props();

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

  // 根滚动视口（对齐 Semi：dom 即根 .calendar-day/week，overflow:auto）。初始滚到 scrollTop 偏移
  // （对齐 Semi componentDidMount: dom.scrollTop = props.scrollTop）。
  let rootEl = $state<HTMLDivElement | null>(null);
  $effect(() => {
    if (!isTimeGrid || !rootEl) return;
    void mode;
    rootEl.scrollTop = scrollTop;
  });

  // --- Intl 格式化器（语言来自 LocaleProvider 的 loc().code） ---
  const localeCode = $derived(loc().code);
  const weekdayFmt = $derived(new Intl.DateTimeFormat(localeCode, { weekday: 'short' }));
  const weekdayLongFmt = $derived(new Intl.DateTimeFormat(localeCode, { weekday: 'long' }));
  const monthShortFmt = $derived(new Intl.DateTimeFormat(localeCode, { month: 'short' }));
  const titleFmt = $derived(new Intl.DateTimeFormat(localeCode, { year: 'numeric', month: 'long' }));
  const fullDateFmt = $derived(
    new Intl.DateTimeFormat(localeCode, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }),
  );
  const slotTimeFmt = $derived(new Intl.DateTimeFormat(localeCode, { hour: '2-digit', minute: '2-digit' }));

  // 纯日期数字（对齐 Semi date-fns format(date,'d')）。
  function dayString(d: Date): string {
    return String(d.getDate());
  }
  function weekdayName(d: Date): string {
    return weekdayFmt.format(d);
  }

  // --- 每个视图展示的「列」（一列 = 一天） ---
  const columnDates = $derived.by<Date[]>(() => {
    if (mode === 'day') return [anchor];
    if (mode === 'week') {
      const ws = startOfWeek(anchor, weekStartsOn);
      return Array.from({ length: 7 }, (_, i) => addDaysLocal(ws, i));
    }
    if (mode === 'range') {
      if (!range) return [anchor];
      const n = Math.max(1, differenceInCalendarDays(range[1], range[0]));
      return Array.from({ length: n }, (_, i) => addDaysLocal(range[0], i));
    }
    return [];
  });

  const isTimeGrid = $derived(mode === 'day' || mode === 'week' || mode === 'range');
  // week/range 共用 weekCalendar 结构（同 class 前缀 cd-calendar-week）；day 用 dayCalendar 结构。
  const isWeekLike = $derived(mode === 'week' || mode === 'range');

  // 全天/跨天事件桶。
  const allDayBucket = $derived(allDayEventMap(events));

  const eventByKey = $derived.by(() => {
    const m = new Map<CalendarEvent['key'], CalendarEvent>();
    for (const e of events) m.set(e.key, e);
    return m;
  });
  function origEvent(key: CalendarEvent['key'], children: unknown): CalendarEvent {
    return eventByKey.get(key) ?? ({ key, children } as CalendarEvent);
  }

  // --- 时间轴视图：顶部跨天/全天条布局 ---
  const spanEvents = $derived.by<PositionedSpanEvent[]>(() => {
    if (!isTimeGrid) return [];
    if (mode === 'week') return parseWeekSpanEvents(allDayBucket, startOfWeek(anchor, weekStartsOn), weekStartsOn);
    if (mode === 'range' && range) return parseSpanEvents(allDayBucket, range[0], range[1]);
    if (mode === 'day') return parseSpanEvents(allDayBucket, anchor, addDaysLocal(anchor, 1));
    return [];
  });
  const allDayRows = $derived(isTimeGrid ? Math.max(1, calcRowHeight(spanEvents)) : 0);

  const dayBucket = $derived(parseEvents(events).day);
  function positionedDay(date: Date): PositionedDayEvent[] {
    return getDailyEvents(dayBucket, date).day;
  }

  // --- month 视图 ---
  const monthWeeks = $derived.by(() => {
    if (mode !== 'month') return [];
    const cells = getMonthGrid(anchor, weekStartsOn);
    const out: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  });
  const monthEventMap = $derived(mode === 'month' ? getMonthEvents(events, anchor, weekStartsOn) : {});
  // 对齐 Semi calcItemLimit = ceil((cellHeight - 60) / 24)，按周行实测高度动态算。
  let monthWeekH = $state(0);
  const MONTH_CONTENT_PADDING = 60;
  const MONTH_CONTENT_HEIGHT = 24;
  const monthItemLimit = $derived(
    monthWeekH > 0 ? Math.max(0, Math.ceil((monthWeekH - MONTH_CONTENT_PADDING) / MONTH_CONTENT_HEIGHT)) : 2,
  );

  // 月视图星期表头（用第一周的日期生成本地化星期名）。
  const monthHeaderWeekdays = $derived.by<{ name: string; weekend: boolean }[]>(() => {
    const ws = startOfWeek(anchor, weekStartsOn);
    return weekdayOrder(weekStartsOn).map((_, i) => {
      const d = addDaysLocal(ws, i);
      return { name: weekdayName(d), weekend: isWeekend(d) };
    });
  });

  // --- 头部标题（仅 aria-label 用；Semi 无标题） ---
  const title = $derived.by(() => {
    if (mode === 'day') return fullDateFmt.format(anchor);
    if (mode === 'week') {
      const cols = columnDates;
      const first = cols[0];
      const last = cols[cols.length - 1];
      return first && last ? `${monthShortFmt.format(first)} ${dayString(first)} – ${dayString(last)}` : '';
    }
    if (mode === 'range' && range) return `${titleFmt.format(range[0])}`;
    return titleFmt.format(anchor);
  });

  // 头部月份标签（对齐 Semi renderHeader 的 month = format(value,'LLL')）。
  const monthLabel = $derived(monthShortFmt.format(anchor));

  // --- 时间列（对齐 Semi timeCol：Array(24)=0..23，第 0 项文案清空）---
  const HOURS = Array.from({ length: 24 }, (_, h) => h);
  function hourLabel(h: number): string {
    if (renderTimeDisplay) {
      const v = renderTimeDisplay(h);
      return typeof v === 'string' ? v : String(v ?? '');
    }
    if (h === 0) return '';
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
  function emitDayClick(d: Date, e: Event) {
    onClick?.(e, new Date(d.getFullYear(), d.getMonth(), d.getDate()));
  }

  function childrenIsSnippet(c: unknown): c is Snippet {
    return typeof c === 'function';
  }
  function childrenText(c: unknown): string {
    return typeof c === 'string' ? c : '';
  }

  // 事件绝对定位样式（时间轴列内，对齐 Semi DayCol renderEvents）。
  function timedStyle(ev: PositionedDayEvent, h: number): string {
    const top = ev.startPos * h;
    const rawH = (ev.endPos - ev.startPos) * h;
    const eh = Math.max(minEventHeight, rawH);
    const left = typeof ev.left === 'number' ? `${ev.left}px` : ev.left;
    return `top:${top}px;height:${eh}px;left:${left};`;
  }
  // 全天条样式（对齐 Semi renderAllDayEvents：left/width%, top:${topInd}em）。
  function spanStyle(ev: PositionedSpanEvent): string {
    return `left:${ev.leftPos * 100}%;width:${ev.width * 100}%;top:${ev.topInd}em;`;
  }
  // 月视图跨天条样式（对齐 Semi renderEvents：left/width%, top:${topInd}em）。
  function monthSpanStyle(ev: PositionedSpanEvent): string {
    return `left:${ev.leftPos * 100}%;width:${ev.width * 100}%;top:${ev.topInd}em;`;
  }

  // 当前时间红线位置（滚动内容内），仅当天列显示。
  const currTimeTop = $derived(showCurrTime ? getPos(now) * scrollContentHeight : 0);
  function isNowColumn(d: Date): boolean {
    return isSameDay(d, now);
  }

  const sizePx = (v: number | string | undefined) =>
    v === undefined ? undefined : typeof v === 'number' ? `${v}px` : v;

  interface MonthCellEvent {
    key: CalendarEvent['key'];
    children: unknown;
  }
  // 某周内 topInd < limit 的跨天条（对齐 Semi renderEvents）。
  function monthWeekSpans(weekIndex: number): PositionedSpanEvent[] {
    const week = monthEventMap[weekIndex];
    if (!week) return [];
    return week.display.filter((s) => s.topInd < monthItemLimit);
  }
  function monthCellOverflow(
    weekIndex: number,
    colIndex: number,
  ): { remaining: number; all: MonthCellEvent[] } {
    const week = monthEventMap[weekIndex];
    if (!week) return { remaining: 0, all: [] };
    const col: MonthCellEvent[] = (week.day[colIndex] ?? [])
      .filter((x) => x != null)
      .map((x) => ({ key: x.key, children: x.children }));
    const remaining = Math.max(0, col.length - monthItemLimit);
    return { remaining, all: col };
  }
</script>

{#snippet eventContent(ev: CalendarEvent)}
  {#if childrenIsSnippet(ev.children)}
    {@render (ev.children as Snippet)()}
  {:else}
    {childrenText(ev.children)}
  {/if}
{/snippet}

<!-- 时间列（对齐 Semi TimeCol：ul.calendar-time-items > li.calendar-time-item > span） -->
{#snippet timeCol()}
  <div class="cd-calendar-time cd-calendar-{isWeekLike ? 'week' : 'day'}-sticky-left" aria-hidden="true">
    <ul class="cd-calendar-time-items">
      {#each HOURS as h (h)}
        <li class="cd-calendar-time-item"><span>{hourLabel(h)}</span></li>
      {/each}
    </ul>
  </div>
{/snippet}

<!-- 单日列（对齐 Semi DayCol：div.grid > div.grid-content > (curr + ul.grid-skeleton(50 li) + dateGridRender + ul.event-items)） -->
{#snippet dayCol(colDate: Date, showCurr: boolean, weekend: boolean)}
  {@const positioned = positionedDay(colDate)}
  <div class="cd-calendar-grid" role="presentation">
    <div class="cd-calendar-grid-content" role="gridcell" aria-label={fullDateFmt.format(colDate)}>
      {#if showCurr && showCurrTime && isNowColumn(colDate)}
        <div class="cd-calendar-grid-curr-circle" style:top={`${currTimeTop}px`}></div>
        <div class="cd-calendar-grid-curr-line" style:top={`${currTimeTop}px`}></div>
      {/if}
      <!-- 对齐 Semi dayCol renderGrid：25×2 个空 <li data-time onClick>，整点 li 有 row-line class。
           点击绑 li 本身（无 button 子元素）；li 加 role/tabindex/keydown 保留键盘可达。 -->
      <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
      <ul class="cd-calendar-grid-skeleton" class:cd-calendar-weekend={weekend} role="row">
        {#each { length: 25 } as _, item (item)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <li
            class="cd-calendar-grid-skeleton-row-line"
            data-time={`${String(item).padStart(2, '0')}:00:00`}
            role="button"
            tabindex="-1"
            aria-label={slotLabel(colDate, item * 2)}
            onclick={(e) => emitTimeClick(colDate, item * 2, e)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emitTimeClick(colDate, item * 2, e); } }}
          ></li>
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <li
            data-time={`${String(item).padStart(2, '0')}:30:00`}
            role="button"
            tabindex="-1"
            aria-label={slotLabel(colDate, item * 2 + 1)}
            onclick={(e) => emitTimeClick(colDate, item * 2 + 1, e)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emitTimeClick(colDate, item * 2 + 1, e); } }}
          ></li>
        {/each}
      </ul>
      {#if dateGridRender}
        {@const extra = dateGridRender(colDate.toString(), colDate)}
        {#if extra}{@render extra()}{/if}
      {/if}
      <ul class="cd-calendar-event-items">
        {#each positioned as ev (ev.key)}
          <li class="cd-calendar-event-item cd-calendar-event-day" style={timedStyle(ev, scrollContentHeight)}>
            {@render eventContent(origEvent(ev.key, ev.children))}
          </li>
        {/each}
      </ul>
    </div>
  </div>
{/snippet}

<!-- 全天区（对齐 Semi renderAllDay：div.all-day > ul.tag.all-day-tag.sticky-left + div.all-day-content > [skeleton] + ul.event-items） -->
{#snippet allDayRow()}
  <div class="cd-calendar-all-day" style:height={isWeekLike ? `${allDayRows}em` : undefined}>
    <ul class="cd-calendar-tag cd-calendar-all-day-tag cd-calendar-{isWeekLike ? 'week' : 'day'}-sticky-left">
      <span>{loc().t('Calendar.allDay')}</span>
    </ul>
    <!-- 对齐 Semi：week/range 全天区 content 有 calendar-content class，day 只有 all-day-content -->
    <div class="cd-calendar-all-day-content" class:cd-calendar-content={isWeekLike} role="gridcell">
      {#if isWeekLike}
        <!-- week/range 全天区有列骨架（对齐 Semi all-day-skeleton） -->
        <ul class="cd-calendar-all-day-skeleton">
          {#each columnDates as d (d.getTime())}
            <li class:cd-calendar-weekend={markWeekend && isWeekend(d)}></li>
          {/each}
        </ul>
      {/if}
      {#if allDayEventsRender}
        {@const rendered = allDayEventsRender(allDayBucket)}
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
{/snippet}

{#if mode === 'day'}
  <!-- ===== day 视图（对齐 Semi dayCalendar：根无 role）===== -->
  <div
    class="cd-calendar-day"
    bind:this={rootEl}
    style:height={sizePx(height)}
    style:width={sizePx(width)}
  >
    <div class="cd-calendar-day-sticky-top">
      {#if header}{@render header()}{/if}
      {@render allDayRow()}
    </div>
    <div class="cd-calendar-day-scroll-wrapper">
      <div class="cd-calendar-day-scroll" bind:clientHeight={scrollContentHeight}>
        {@render timeCol()}
        {@render dayCol(anchor, true, markWeekend && isWeekend(anchor))}
      </div>
    </div>
  </div>
{:else if isWeekLike}
  <!-- ===== week / range 视图（对齐 Semi weekCalendar / rangeCalendar：根无 role）===== -->
  <div
    class="cd-calendar-week"
    bind:this={rootEl}
    style:height={sizePx(height)}
    style:width={sizePx(width)}
    style:--cd-calendar-col-count={columnDates.length}
  >
    <div class="cd-calendar-week-sticky-top">
      {#if header}{@render header()}{/if}
      <!-- 日期表头（对齐 Semi weekCalendar.renderHeader：week-header 无 role，li 无 role；grid 有 role=gridcell） -->
      <div class="cd-calendar-week-header">
        <ul class="cd-calendar-tag cd-calendar-week-tag cd-calendar-week-sticky-left"><span>{monthLabel}</span></ul>
        <div class="cd-calendar-week-grid" role="gridcell">
          <ul class="cd-calendar-week-grid-row">
            {#each columnDates as d (d.getTime())}
              <li
                class:cd-calendar-today={isSameDay(d, now)}
                class:cd-calendar-weekend={markWeekend && isWeekend(d)}
              >
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
      {@render allDayRow()}
    </div>
    <div class="cd-calendar-week-scroll-wrapper">
      <div class="cd-calendar-week-scroll" bind:clientHeight={scrollContentHeight}>
        {@render timeCol()}
        {#each columnDates as d (d.getTime())}
          {@render dayCol(d, true, markWeekend && isWeekend(d))}
        {/each}
      </div>
    </div>
  </div>
{:else}
  <!-- ===== month 视图（对齐 Semi monthCalendar）===== -->
  <div class="cd-calendar-month" role="grid" aria-label={title} style:height={sizePx(height)} style:width={sizePx(width)}>
    <div class="cd-calendar-month-sticky-top" role="presentation">
      {#if header}{@render header()}{/if}
      <!-- 星期表头（对齐 Semi renderHeader：month-header > grid > grid-row li） -->
      <div class="cd-calendar-month-header" role="presentation">
        <div class="cd-calendar-month-grid" role="presentation">
          <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
          <ul class="cd-calendar-month-grid-row" role="row">
            {#each monthHeaderWeekdays as wd, i (i)}
              <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
              <li
                class:cd-calendar-weekend={markWeekend && wd.weekend}
                role="columnheader"
                aria-label={wd.name}
              ><span>{wd.name}</span></li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
    <div class="cd-calendar-month-grid-wrapper" role="presentation">
      <div class="cd-calendar-month-week" role="presentation">
        <ul class="cd-calendar-month-grid-col" role="presentation">
          {#each monthWeeks as week, wi (wi)}
            <!-- 每周行（对齐 Semi renderWeekRow：weekrow role=presentation > skeleton(li) + event-items） -->
            <div class="cd-calendar-month-weekrow" role="presentation" bind:clientHeight={monthWeekH}>
              <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
              <ul class="cd-calendar-month-skeleton" role="row">
                {#each week as cell, ci (cell.date.getTime())}
                  {@const { remaining, all } = monthCellOverflow(wi, ci)}
                  {@const isToday = isSameDay(cell.date, now)}
                  {@const sameMonth = isSameMonth(cell.date, anchor)}
                  {#snippet monthDate()}
                    {#if renderDateDisplay}
                      {@render renderDateDisplay(cell.date)}
                    {:else if dayString(cell.date) === '1'}
                      <!-- 对齐 Semi formatDayString：每月 1 号显示「X月 1」（月份缩写 + today-date） -->
                      <span class="cd-calendar-month-date">{monthShortFmt.format(cell.date)}<span class="cd-calendar-today-date">&nbsp;{dayString(cell.date)}</span></span>
                    {:else}
                      <span class="cd-calendar-month-date"><span class="cd-calendar-today-date">{dayString(cell.date)}</span></span>
                    {/if}
                  {/snippet}
                  {#if remaining > 0}
                    {#snippet cardTitle()}
                      <div class="cd-calendar-month-event-card-header-info">
                        <div class="cd-calendar-month-event-card-header-info-weekday">{weekdayLongFmt.format(cell.date)}</div>
                        <div class="cd-calendar-month-event-card-header-info-date">{dayString(cell.date)}</div>
                      </div>
                    {/snippet}
                    <Popover
                      trigger="click"
                      position="bottom"
                      showCloseButton
                      title={cardTitle}
                      onOpenChange={(open) => { if (!open) onClose?.(new Event('close')); }}
                    >
                      <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
                      <li
                        class:cd-calendar-today={isToday}
                        class:cd-calendar-weekend={markWeekend && isWeekend(cell.date)}
                        class:cd-calendar-month-same={sameMonth}
                        role="gridcell"
                        aria-label={cell.date.toLocaleDateString()}
                        aria-current={isToday ? 'date' : undefined}
                        onclick={(e) => emitDayClick(cell.date, e)}
                        onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emitDayClick(cell.date, e); } }}
                      >
                        {@render monthDate()}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div
                          class="cd-calendar-month-event-card-wrapper"
                          onclick={(e) => { e.stopPropagation(); onMoreClick?.(e, cell.date, remaining); }}
                        >{loc().t('Calendar.remaining', { count: remaining })}</div>
                        {#if dateGridRender}
                          {@const extra = dateGridRender(cell.date.toString(), cell.date)}
                          {#if extra}{@render extra()}{/if}
                        {/if}
                      </li>
                      {#snippet content()}
                        <div class="cd-calendar-month-event-card">
                          <div class="cd-calendar-month-event-card-body">
                            <ul class="cd-calendar-month-event-card-list">
                              {#each all as ev (ev.key)}
                                <li>{@render eventContent(origEvent(ev.key, ev.children))}</li>
                              {/each}
                            </ul>
                          </div>
                        </div>
                      {/snippet}
                    </Popover>
                  {:else}
                    <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
                    <li
                      class:cd-calendar-today={isToday}
                      class:cd-calendar-weekend={markWeekend && isWeekend(cell.date)}
                      class:cd-calendar-month-same={sameMonth}
                      role="gridcell"
                      aria-label={cell.date.toLocaleDateString()}
                      aria-current={isToday ? 'date' : undefined}
                      onclick={(e) => emitDayClick(cell.date, e)}
                      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emitDayClick(cell.date, e); } }}
                    >
                      {@render monthDate()}
                      {#if dateGridRender}
                        {@const extra = dateGridRender(cell.date.toString(), cell.date)}
                        {#if extra}{@render extra()}{/if}
                      {/if}
                    </li>
                  {/if}
                {/each}
              </ul>
              <ul class="cd-calendar-event-items">
                {#each monthWeekSpans(wi) as ev (ev.key)}
                  <li class="cd-calendar-event-item cd-calendar-event-month" style={monthSpanStyle(ev)}>
                    {@render eventContent(origEvent(ev.key, ev.children))}
                  </li>
                {/each}
              </ul>
            </div>
          {/each}
        </ul>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ============================ 通用（对齐 Semi calendar.scss：根无 border/背景/圆角，仅 ul/li reset）============================ */
  /* ul/li reset 用 :where() 保持 0 特异性，避免压过组件自身 class 的 padding（如 tag padding-right）。 */
  .cd-calendar-day :global(:where(ul, li)),
  .cd-calendar-week :global(:where(ul, li)),
  .cd-calendar-month :global(:where(ul, li)) {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  /* sticky 顶部（对齐 Semi -sticky-top） */
  .cd-calendar-day-sticky-top,
  .cd-calendar-week-sticky-top,
  .cd-calendar-month-sticky-top {
    position: sticky;
    inset-block-start: 0;
    inset-inline: 0;
    z-index: var(--cd-calendar-z-stickytop);
    background: var(--cd-calendar-color-sticky-bg);
  }

  /* 周末底色（对齐 Semi .calendar-weekend） */
  .cd-calendar-weekend {
    background: var(--cd-calendar-color-weekend-bg);
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
  /* 对齐 Semi .event-day：定位/尺寸/溢出，外观由 children 决定 */
  .cd-calendar-event-day {
    position: absolute;
    left: 0;
    right: 0;
    z-index: var(--cd-calendar-z-item);
  }
  /* 对齐 Semi .event-allday { position:absolute; & > * { font-size-regular } }：
     父全天区 font-size:26px 令 1em=26px → top:${topInd}em 步长=26px；条高=26px(与步长一致，不重叠)；
     children 恢复 regular 字号并 height:100% 撑满条。 */
  .cd-calendar-event-allday,
  .cd-calendar-event-month {
    position: absolute;
  }
  .cd-calendar-event-allday {
    height: var(--cd-calendar-height-allday);
  }
  .cd-calendar-event-allday > :global(*) {
    font-size: var(--cd-font-size-regular);
  }
  .cd-calendar-event-month > :global(*) {
    font-size: var(--cd-font-size-regular);
  }

  /* ============================ day / week 共用（对齐 Semi .calendar-day, .calendar-week）============================ */
  /* 对齐 Semi .calendar-day, .calendar-week { overflow: auto }（根滚动容器，day 为默认 block）。 */
  .cd-calendar-day,
  .cd-calendar-week {
    overflow: auto;
  }
  /* 对齐 Semi .calendar-week { position: relative; display: grid }。 */
  .cd-calendar-week {
    position: relative;
    display: grid;
  }

  /* sticky 左列（时间列 / tag 列，对齐 Semi -sticky-left） */
  .cd-calendar-day-sticky-left,
  .cd-calendar-week-sticky-left {
    position: sticky;
    inset-inline-start: 0;
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
    inset-inline: 0;
    width: 100%;
  }

  /* 滚动区容器高度（对齐 Semi -scroll-wrapper：100% - 表头/全天区高，约束滚动区不撑破容器） */
  .cd-calendar-day-scroll-wrapper {
    height: var(--cd-calendar-height-day-scroll-wrapper);
  }
  .cd-calendar-week-scroll-wrapper {
    height: var(--cd-calendar-height-week-scroll-wrapper);
  }
  /* 滚动内容区（对齐 Semi -scroll：无自身 overflow，滚动由根 .calendar-day/week 承担） */
  .cd-calendar-day-scroll,
  .cd-calendar-week-scroll {
    display: flex;
    flex: 1 1 auto;
    position: relative;
    align-items: flex-start;
  }

  /* 时间列（对齐 Semi .calendar-time / .time-items / .time-item） */
  .cd-calendar-time {
    height: auto;
    display: flex;
    flex: none;
    align-items: flex-start;
    padding-right: var(--cd-calendar-spacing-time-padding-right);
  }
  .cd-calendar-time-items {
    position: relative;
    min-width: var(--cd-calendar-width-tag-col);
    background: var(--cd-calendar-color-bg);
    box-sizing: border-box;
    margin-left: auto;
  }
  .cd-calendar-time-item {
    position: relative;
    height: var(--cd-calendar-height-day-grid);
    text-align: right;
  }
  .cd-calendar-time-item span {
    display: block;
    position: relative;
    top: var(--cd-calendar-spacing-time-item-span-top);
    color: var(--cd-calendar-color-day-text-default);
    font-size: var(--cd-font-size-regular);
  }

  /* 单日列（对齐 Semi .calendar-grid { display:flex; align-items:flex-start; flex:1 1 auto; position:relative }） */
  .cd-calendar-grid {
    display: flex;
    align-items: flex-start;
    flex: 1 1 auto;
    position: relative;
  }
  .cd-calendar-grid-content {
    flex: 1 0 auto;
    min-width: var(--cd-calendar-width-day-grid);
    height: 100%;
    position: relative;
  }
  .cd-calendar-grid-skeleton {
    position: relative;
    box-sizing: border-box;
  }
  .cd-calendar-grid-skeleton li {
    position: relative;
    height: calc(var(--cd-calendar-height-day-grid) / 2);
  }
  .cd-calendar-grid-skeleton li:last-child,
  .cd-calendar-grid-skeleton li:nth-last-child(2) {
    height: 0;
  }
  /* 整点横线（对齐 Semi .grid-skeleton-row-line::after），首条不画 */
  /* 对齐 Semi .grid-skeleton-row-line::after：只有 left/right，无 top/bottom
     （横线停在整点 li 静态流位置 = 整点处，与时间标签垂直对齐）。 */
  .cd-calendar-grid-skeleton-row-line::after {
    content: '';
    border-bottom: 1px solid var(--cd-calendar-color-day-border);
    position: absolute;
    left: 0;
    right: 0;
    z-index: var(--cd-calendar-z-line);
    pointer-events: none;
  }
  .cd-calendar-grid-skeleton-row-line:first-child::after {
    border: 0;
  }
  /* 半小时可点击格：对齐 Semi——空 li 可点击，无 hover 背景，仅 focus 环 */
  .cd-calendar-grid-skeleton li {
    cursor: pointer;
  }
  .cd-calendar-grid-skeleton li:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--cd-focus-ring);
  }

  /* 当前时间红线 + 原点（对齐 Semi .grid-curr-line / -circle） */
  .cd-calendar-grid-curr-circle {
    background: var(--cd-calendar-color-currcircle-bg-default);
    border-radius: var(--cd-calendar-radius-today-date);
    position: absolute;
    height: var(--cd-calendar-width-currcircle);
    width: var(--cd-calendar-width-currcircle);
    margin-top: var(--cd-calendar-spacing-currcircle-margin-top);
    z-index: var(--cd-calendar-z-curr);
  }
  .cd-calendar-grid-curr-line {
    position: absolute;
    left: 0;
    right: 0;
    z-index: var(--cd-calendar-z-curr);
    border-top: 1px solid var(--cd-calendar-color-curr-border);
    pointer-events: none;
  }

  /* ============================ week / range 表头（对齐 Semi .calendar-week-header / -grid-row）============================ */
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

  /* week 列竖线（对齐 Semi .week .grid-skeleton li border-right，最后列不画） */
  .cd-calendar-week .cd-calendar-grid-skeleton li {
    border-right: 1px solid var(--cd-calendar-color-day-border);
  }
  .cd-calendar-week .cd-calendar-grid:last-child .cd-calendar-grid-content .cd-calendar-grid-skeleton li {
    border-right: 0;
  }

  /* ============================ month 视图（对齐 Semi .calendar-month）============================ */
  .cd-calendar-month {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-size: var(--cd-font-size-regular);
  }
  .cd-calendar-month-header {
    display: flex;
    flex: 1 1 auto;
    align-items: flex-start;
    color: var(--cd-calendar-color-day-text-default);
  }
  .cd-calendar-month-grid {
    flex: 1 1 auto;
    box-sizing: border-box;
  }
  .cd-calendar-month-grid-row {
    display: flex;
    box-sizing: border-box;
  }
  .cd-calendar-month-grid-row li {
    flex: 1;
    white-space: nowrap;
    text-align: right;
    padding-right: var(--cd-calendar-spacing-skeletion-grid-row-li-padding-right);
    box-sizing: border-box;
    border-bottom: 1px solid var(--cd-calendar-color-day-border);
    color: var(--cd-calendar-color-day-text-default);
    line-height: var(--cd-calendar-height-allday);
  }
  .cd-calendar-month-grid-row li span {
    display: inline-block;
    text-align: right;
  }
  .cd-calendar-month-grid-wrapper {
    flex: 1 1 auto;
    min-height: 0;
  }
  .cd-calendar-month-week {
    height: 100%;
  }
  .cd-calendar-month-grid-col {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
  }
  /* 每周行（对齐 Semi .month-weekrow） */
  .cd-calendar-month-weekrow {
    flex: 1 1 auto;
    position: relative;
    min-height: 0;
  }
  /* 日格骨架（对齐 Semi .month-skeleton，绝对定位铺满整周行） */
  .cd-calendar-month-skeleton {
    display: flex;
    box-sizing: border-box;
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
  .cd-calendar-month-skeleton li {
    flex: 1;
    position: relative;
    overflow: hidden;
    height: 100%;
    white-space: nowrap;
    text-align: right;
    padding-right: var(--cd-calendar-spacing-skeletion-grid-row-li-padding-right);
    padding-top: var(--cd-calendar-spacing-skeleton-li-child-padding-top);
    box-sizing: border-box;
    border-right: 1px solid var(--cd-calendar-color-day-border);
    border-bottom: 1px solid var(--cd-calendar-color-day-border);
    color: var(--cd-calendar-color-day-text-default);
    cursor: pointer;
    outline: none;
  }
  .cd-calendar-month-skeleton li:last-child {
    border-right: none;
  }
  .cd-calendar-month-skeleton li:focus-visible {
    box-shadow: inset 0 0 0 2px var(--cd-focus-ring);
  }
  /* 当月日期文字深黑色——逐字对齐 Semi .month-skeleton .month-same { color: date-text-default }
     （后代 selector 特异性 0,2,0 > .month-skeleton li 的 0,1,1，深黑压过灰）。 */
  .cd-calendar-month-skeleton .cd-calendar-month-same {
    color: var(--cd-calendar-color-date-text-default);
  }
  /* 日期数字（对齐 Semi .month-date：绝对定位右上，today-date 圆标） */
  .cd-calendar-month-date {
    position: absolute;
    right: var(--cd-calendar-spacing-month-date-right);
    z-index: var(--cd-calendar-z-line);
  }
  .cd-calendar-today .cd-calendar-month-date .cd-calendar-today-date {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--cd-calendar-width-today-date);
    height: var(--cd-calendar-width-today-date);
    border-radius: var(--cd-calendar-radius-today-date);
    background: var(--cd-calendar-color-bg-active);
    color: var(--cd-calendar-color-text-active);
  }
  /* 跨天条层（对齐 Semi .month .event-items { position:absolute; top:31px; right:0; bottom:20px; left:0; overflow:hidden }） */
  .cd-calendar-month-weekrow .cd-calendar-event-items {
    position: absolute;
    top: var(--cd-calendar-spacing-event-items-top);
    right: 0;
    bottom: var(--cd-calendar-spacing-event-items-bottom);
    left: 0;
    overflow: hidden;
  }
  .cd-calendar-month-weekrow .cd-calendar-event-month {
    height: var(--cd-calendar-height-month-week-row-event-month);
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /* 「还有 N 项」（对齐 Semi .month-event-card-wrapper：右下角，可点击） */
  .cd-calendar-month-event-card-wrapper {
    font-size: var(--cd-font-size-small);
    display: block;
    position: absolute;
    right: var(--cd-calendar-spacing-month-event-card-wrapper-right);
    bottom: 0;
    z-index: var(--cd-calendar-z-item);
    padding-top: var(--cd-calendar-spacing-month-event-card-wrapper-padding-top);
    padding-inline: 2px;
    color: var(--cd-calendar-color-day-text-default);
    background: var(--cd-color-bg-2);
    border-radius: var(--cd-border-radius-small, 3px);
    user-select: none;
    cursor: pointer;
  }
  .cd-calendar-month-event-card-wrapper:hover {
    text-decoration: underline;
  }

  /* +N 卡片（对齐 Semi .month-event-card / -header-info / -body / -list） */
  .cd-calendar-month-event-card {
    width: var(--cd-calendar-width-card);
    max-width: 100%;
  }
  .cd-calendar-month-event-card-header-info {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .cd-calendar-month-event-card-header-info-weekday {
    color: var(--cd-calendar-color-day-text-default);
    font-size: var(--cd-font-size-small);
  }
  .cd-calendar-month-event-card-header-info-date {
    color: var(--cd-calendar-color-date-text-default);
    font-size: var(--cd-font-size-header, 1.5rem);
    font-weight: 600;
    margin-top: var(--cd-calendar-spacing-header-info-date-margin-top);
  }
  .cd-calendar-month-event-card-body {
    padding: 0 var(--cd-calendar-spacing-body-pading-x);
  }
  .cd-calendar-month-event-card-list {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-extra-tight);
  }
  .cd-calendar-month-event-card-list li {
    padding: var(--cd-spacing-extra-tight) 0;
  }
</style>
