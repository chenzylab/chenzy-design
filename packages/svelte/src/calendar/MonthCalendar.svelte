<!--
  MonthCalendar — 月视图，对齐 Semi `semi-ui/calendar/monthCalendar.tsx`。
  DOM：cd-calendar-month > month-sticky-top(header + month-header) + month-grid-wrapper > month-week > grid-col > N×month-weekrow。
  6×7 网格 + Popover "+N" 卡片（含 IconClose 关闭按钮）。
  从 Calendar.svelte 的 mode==='month'（即 else 分支）原样迁出，逻辑不变；本视图独立管理自己的响应式状态。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    getMonthEvents,
    getMonthWeeks,
    startOfWeek,
    addDaysLocal,
    isSameDay,
    isSameMonth,
    isWeekend,
    weekdayOrder,
    type CalendarEvent,
    type PositionedSpanEvent,
  } from '@chenzy-design/core';
  import { IconClose } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import { Popover } from '../popover/index.js';
  import { IconButton } from '../iconbutton/index.js';
  import { MONTH_CONTENT_PADDING, MONTH_CONTENT_HEIGHT } from './constants.js';
  import type { MonthCalendarProps } from './types.js';

  let {
    displayValue,
    header,
    events = [],
    weekStartsOn = 0,
    markWeekend = false,
    width,
    height = 600,
    class: className,
    style,
    onClick,
    onClose,
    onMoreClick,
    renderDateDisplay,
    dateGridRender,
  }: MonthCalendarProps = $props();

  const loc = useLocale();

  // 展示锚点：纯受控 displayValue（缺省 today）。对齐 Semi——无内置导航。
  const fallbackAnchor = new Date();
  const anchor = $derived(displayValue ?? fallbackAnchor);

  // 当前时刻（today 高亮判断用）。对齐原 Calendar.svelte：showCurrTime 缺省 true，
  // month 视图虽无 prop 但共享同一状态，故此处无条件跑 30s 刷新（月视图无红线，只用于 today 高亮）。
  let now = $state(new Date());
  $effect(() => {
    const id = setInterval(() => {
      now = new Date();
    }, 30_000);
    return () => clearInterval(id);
  });

  // --- Intl 格式化器（语言来自 LocaleProvider 的 loc().code） ---
  const localeCode = $derived(loc().code);
  const weekdayFmt = $derived(new Intl.DateTimeFormat(localeCode, { weekday: 'short' }));
  const weekdayLongFmt = $derived(new Intl.DateTimeFormat(localeCode, { weekday: 'long' }));
  const monthShortFmt = $derived(new Intl.DateTimeFormat(localeCode, { month: 'short' }));
  const titleFmt = $derived(new Intl.DateTimeFormat(localeCode, { year: 'numeric', month: 'long' }));

  function dayString(d: Date): string {
    return String(d.getDate());
  }
  function weekdayName(d: Date): string {
    return weekdayFmt.format(d);
  }

  // --- month 视图网格（对齐 Semi getMonthlyData：行数按 getWeeksInMonth 动态算，4/5/6 周皆有可能，
  //     不是固定 6 周——行数越少，每行分到的高度越大，"+N"/事件条才有 Semi 同款的宽松空间） ---
  const monthWeeks = $derived(getMonthWeeks(anchor, weekStartsOn));
  const monthEventMap = $derived(getMonthEvents(events, anchor, weekStartsOn));
  // 对齐 Semi calcItemLimit = ceil((cellHeight - 60) / 24)，按周行实测高度动态算。
  let monthWeekH = $state(0);
  const monthItemLimit = $derived(
    monthWeekH > 0 ? Math.max(0, Math.ceil((monthWeekH - MONTH_CONTENT_PADDING) / MONTH_CONTENT_HEIGHT)) : 2,
  );

  // 「还有 N 项」卡片开合状态（对齐 Semi showCard：key=date.toString()，同时只开一张）。
  let openCardKey = $state<string | null>(null);
  function closeCard(e: Event, key: string) {
    if (openCardKey === key) openCardKey = null;
    onClose?.(e);
  }

  // 月视图星期表头（用第一周的日期生成本地化星期名）。
  const monthHeaderWeekdays = $derived.by<{ name: string; weekend: boolean }[]>(() => {
    const ws = startOfWeek(anchor, weekStartsOn);
    return weekdayOrder(weekStartsOn).map((_, i) => {
      const d = addDaysLocal(ws, i);
      return { name: weekdayName(d), weekend: isWeekend(d) };
    });
  });

  // --- 头部标题（仅 aria-label 用；Semi 无标题） ---
  const title = $derived(titleFmt.format(anchor));

  const eventByKey = $derived.by(() => {
    const m = new Map<CalendarEvent['key'], CalendarEvent>();
    for (const e of events) m.set(e.key, e);
    return m;
  });
  function origEvent(key: CalendarEvent['key'], children: unknown): CalendarEvent {
    return eventByKey.get(key) ?? ({ key, children } as CalendarEvent);
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

  // 月视图跨天条样式（对齐 Semi renderEvents：left/width%, top:${topInd}em）。
  function monthSpanStyle(ev: PositionedSpanEvent): string {
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

<!-- ===== month 视图（对齐 Semi monthCalendar）===== -->
<div class={['cd-calendar-month', className]} role="grid" aria-label={title} style={rootStyle}>
  <div class="cd-calendar-month-sticky-top" role="presentation">
    {#if header}{@render header()}{/if}
    <!-- 星期表头（对齐 Semi renderHeader：month-header > grid > grid-row li） -->
    <div class="cd-calendar-month-header" role="presentation">
      <div class="cd-calendar-month-grid" role="presentation">
        <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
        <ul class="cd-calendar-month-grid-row" role="row">
          {#each monthHeaderWeekdays as wd, i (i)}
            <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
            <li class:cd-calendar-weekend={markWeekend && wd.weekend} role="columnheader" aria-label={wd.name}
              ><span>{wd.name}</span></li
            >
          {/each}
        </ul>
      </div>
    </div>
  </div>
  <div class="cd-calendar-month-grid-wrapper" role="presentation">
    <div class="cd-calendar-month-week" role="presentation">
      <ul class="cd-calendar-month-grid-col" role="presentation">
        {#each monthWeeks as week, wi (wi)}
          <!-- 每周行（对齐 Semi renderWeekRow：weekrow role=presentation > skeleton(li) + event-items）。
               clientHeight 只让第一行真正写入 monthWeekH：Semi this.cellDom 是单一 ref，多行共享同一 ref
               只留最后挂载的那份；Svelte bind:clientHeight 若绑在循环每个节点上，各行尺寸变化会持续
               互相覆写同一个响应式变量，导致 monthItemLimit 在渲染期间抖动、不同行读到不一致的 limit
               而错位重叠。用 {get,set} pair 让非首行的 setter 变成空操作，值稳定来自单一节点。 -->
          <div
            class="cd-calendar-month-weekrow"
            role="presentation"
            bind:clientHeight={() => monthWeekH, (v) => { if (wi === 0) monthWeekH = v; }}
          >
            <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
            <ul class="cd-calendar-month-skeleton" role="row">
              {#each week as date, ci (date.getTime())}
                {@const { remaining, all } = monthCellOverflow(wi, ci)}
                {@const isToday = isSameDay(date, now)}
                {@const sameMonth = isSameMonth(date, anchor)}
                {#snippet monthDate()}
                  {#if renderDateDisplay}
                    {@render renderDateDisplay(date)}
                  {:else if dayString(date) === '1'}
                    <!-- 对齐 Semi formatDayString：每月 1 号显示「X月 1日」——月份缩写 + today-date
                         + locale.datestring 单位后缀（中文「日」、英文空串）。原先漏了后缀。 -->
                    <span class="cd-calendar-month-date">{monthShortFmt.format(date)}<span class="cd-calendar-today-date">&nbsp;{dayString(date)}</span>{loc().t('Calendar.datestring')}</span>
                  {:else}
                    <span class="cd-calendar-month-date"><span class="cd-calendar-today-date">{dayString(date)}</span></span>
                  {/if}
                {/snippet}
                {#if remaining > 0}
                  {@const cardKey = date.toString()}
                  <!-- triggerStyle=display:contents：Tooltip 内层 .cd-tooltip-trigger-custom 已是
                       display:contents，但最外层 .cd-tooltip 仍是普通盒子，会插进
                       .cd-calendar-month-skeleton（display:flex）与 <li>（本应是直接 flex item）
                       之间，让 <li> 脱离 flex 布局、按内容收缩宽度，多个「+N」格子因此错位重叠。
                       显式让外层也 display:contents，使 <li> 重新成为 flex 的直接子项。 -->
                  <Popover
                    trigger="custom"
                    position="bottom"
                    visible={openCardKey === cardKey}
                    triggerStyle="display: contents;"
                  >
                    <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
                    <li
                      class:cd-calendar-today={isToday}
                      class:cd-calendar-weekend={markWeekend && isWeekend(date)}
                      class:cd-calendar-month-same={sameMonth}
                      role="gridcell"
                      aria-label={date.toLocaleDateString()}
                      aria-current={isToday ? 'date' : 'false'}
                      onclick={(e) => emitDayClick(date, e)}
                      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emitDayClick(date, e); } }}
                    >
                      {@render monthDate()}
                      <!-- svelte-ignore a11y_click_events_have_key_events -->
                      <!-- svelte-ignore a11y_no_static_element_interactions -->
                      <div
                        class="cd-calendar-month-event-card-wrapper"
                        onclick={(e) => { e.stopPropagation(); openCardKey = cardKey; onMoreClick?.(e, date, remaining); }}
                      >{loc().t('Calendar.remaining', { count: remaining })}</div>
                      {#if dateGridRender}
                        {@const extra = dateGridRender(date.toString(), date)}
                        {#if extra}{@render extra()}{/if}
                      {/if}
                    </li>
                    {#snippet content()}
                      <div class="cd-calendar-month-event-card">
                        <div class="cd-calendar-month-event-card-content">
                          <div class="cd-calendar-month-event-card-header">
                            <div class="cd-calendar-month-event-card-header-info">
                              <div class="cd-calendar-month-event-card-header-info-weekday">{weekdayLongFmt.format(date)}</div>
                              <div class="cd-calendar-month-event-card-header-info-date">{dayString(date)}</div>
                            </div>
                            <IconButton
                              class="cd-calendar-month-event-card-close"
                              type="tertiary"
                              theme="borderless"
                              size="small"
                              aria-label={loc().t('Calendar.close')}
                              onclick={(e) => closeCard(e, cardKey)}
                            >
                              {#snippet icon()}<IconClose />{/snippet}
                            </IconButton>
                          </div>
                          <div class="cd-calendar-month-event-card-body">
                            <ul class="cd-calendar-month-event-card-list">
                              {#each all as ev (ev.key)}
                                <li>{@render eventContent(origEvent(ev.key, ev.children))}</li>
                              {/each}
                            </ul>
                          </div>
                        </div>
                      </div>
                    {/snippet}
                  </Popover>
                {:else}
                  <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
                  <li
                    class:cd-calendar-today={isToday}
                    class:cd-calendar-weekend={markWeekend && isWeekend(date)}
                    class:cd-calendar-month-same={sameMonth}
                    role="gridcell"
                    aria-label={date.toLocaleDateString()}
                    aria-current={isToday ? 'date' : 'false'}
                    onclick={(e) => emitDayClick(date, e)}
                    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emitDayClick(date, e); } }}
                  >
                    {@render monthDate()}
                    {#if dateGridRender}
                      {@const extra = dateGridRender(date.toString(), date)}
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

<style>
  /* ul/li reset 用 :where() 保持 0 特异性，避免压过组件自身 class 的 padding。 */
  .cd-calendar-month :global(:where(ul, li)) {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  /* sticky 顶部（对齐 Semi -sticky-top：物理属性 top/left/right） */
  .cd-calendar-month-sticky-top {
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
  /* 对齐 Semi .event-month { position:absolute; & > * { font-size-regular } } */
  .cd-calendar-event-month {
    position: absolute;
  }
  .cd-calendar-event-month > :global(*) {
    font-size: var(--cd-font-size-regular);
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
  /* font-size:24px 是 height:1em 的 em 基准（对齐 Semi .event-month { font-size; height:1em }），
     不是文字实际显示字号——内部 children 由 363 行 `> :global(*)` 规则重新缩回 font-size-regular(14px)。
     此前漏了这条 font-size，height:1em 继承了外层 14px 算成 14px 高，装不下文字+padding 而被裁切。 */
  .cd-calendar-month-weekrow .cd-calendar-event-month {
    font-size: var(--cd-calendar-font-month-day-font-size);
    height: var(--cd-calendar-height-month-week-row-event-month);
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /* 「还有 N 项」（对齐 Semi .month-event-card-wrapper：右下角，可点击） */
  .cd-calendar-month-event-card-wrapper {
    font-size: var(--cd-font-size-small);
    /* 显式 line-height：切断从 Popover/Tooltip 外层 .cd-tooltip 继承来的 line-height:0
       （Tooltip.svelte 给 trigger=custom 的 wrapper 归零 line-height 消除 inline-block 基线坑，
       但 display:contents 只让盒子在布局树消失，不阻断 CSS 继承，line-height:0 仍会传给这里，
       导致 12px 文字被压成 2px 高的一条细缝，视觉上像是被裁切/发虚）。 */
    line-height: normal;
    display: block;
    position: absolute;
    right: var(--cd-calendar-spacing-month-event-card-wrapper-right);
    bottom: 0;
    z-index: var(--cd-calendar-z-item);
    padding-top: var(--cd-calendar-spacing-month-event-card-wrapper-padding-top);
    padding-left: 2px;
    padding-right: 2px;
    color: var(--cd-calendar-color-day-text-default);
    background: var(--cd-color-bg-2);
    border-radius: var(--cd-border-radius-small, 3px);
    user-select: none;
    cursor: pointer;
  }
  .cd-calendar-month-event-card-wrapper:hover {
    text-decoration: underline;
  }

  /* +N 卡片（对齐 Semi .month-event-card / -content / -header / -header-info / -body / -list） */
  .cd-calendar-month-event-card {
    width: var(--cd-calendar-width-card);
    max-width: 100%;
  }
  .cd-calendar-month-event-card-content {
    padding: var(--cd-calendar-spacing-month-event-card-content-padding-y) var(--cd-calendar-spacing-month-event-card-content-padding-x);
  }
  .cd-calendar-month-event-card-header {
    display: flex;
    flex-direction: row;
    margin: var(--cd-calendar-spacing-header-margin-y) var(--cd-calendar-spacing-header-margin-x);
  }
  .cd-calendar-month-event-card-header-info {
    display: flex;
    flex: 1;
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
  /* 关闭按钮（对齐 Semi .month-event-card-close：-4px 右外边距，与 header-info 反向抵消视觉留白） */
  .cd-calendar-month-event-card :global(.cd-calendar-month-event-card-close) {
    margin-right: var(--cd-calendar-spacing-month-event-card-close-margin-right);
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

  /* —— RTL（逐条对齐 Semi calendar/rtl.scss）——
     本组件全部用物理属性（left/right/border-right 等，对齐 Semi calendar.scss），
     故 RTL 下逐条显式覆盖为镜像值，不依赖逻辑属性自动翻转。 */
  :global(.cd-rtl) .cd-calendar-month {
    direction: rtl;
  }

  /* 星期表头 / 日格骨架文字与竖线翻边（对齐 Semi rtl.scss .month-grid-row/-skeleton） */
  :global(.cd-rtl) .cd-calendar-month-grid-row li,
  :global(.cd-rtl) .cd-calendar-month-skeleton li {
    text-align: left;
    padding-right: 0;
    padding-left: var(--cd-calendar-spacing-skeletion-grid-row-li-padding-right);
  }
  :global(.cd-rtl) .cd-calendar-month-grid-row li span,
  :global(.cd-rtl) .cd-calendar-month-skeleton li span {
    text-align: left;
  }
  :global(.cd-rtl) .cd-calendar-month-skeleton li {
    border-right: 0;
    border-left: 1px solid var(--cd-calendar-color-day-border);
  }
  :global(.cd-rtl) .cd-calendar-month-skeleton li:last-child {
    border-left: none;
  }
  /* 「还有 N 项」/ 日期数字：右上/右下 → 左上/左下（对齐 Semi rtl.scss .month-event-card-wrapper / .month-date） */
  :global(.cd-rtl) .cd-calendar-month-event-card-wrapper {
    right: auto;
    left: var(--cd-calendar-spacing-month-event-card-wrapper-right);
  }
  :global(.cd-rtl) .cd-calendar-month-date {
    right: auto;
    left: var(--cd-calendar-spacing-month-date-right);
  }
  /* +N 卡片关闭按钮：右外边距 → 左外边距（对齐 Semi rtl.scss .month-event-card-close） */
  :global(.cd-rtl) .cd-calendar-month-event-card-close {
    margin-right: 0;
    margin-left: var(--cd-calendar-spacing-month-event-card-close-margin-right);
  }
</style>
