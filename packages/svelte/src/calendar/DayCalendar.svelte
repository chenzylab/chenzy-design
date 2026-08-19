<!--
  DayCalendar — 日视图，对齐 Semi `semi-ui/calendar/dayCalendar.tsx`。
  DOM：cd-calendar-day(overflow:auto) > day-sticky-top(header + all-day) + day-scroll-wrapper > day-scroll > (TimeCol + 单个 DayCol)。
  从 Calendar.svelte 的 mode==='day' 分支原样迁出，逻辑不变；本视图独立管理自己的响应式状态（不与其他视图共享 script 作用域）。
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
    isSameDay,
    isWeekend,
    type CalendarEvent,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import TimeCol from './TimeCol.svelte';
  import DayCol from './DayCol.svelte';
  import type { DayCalendarProps } from './types.js';

  let {
    displayValue,
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
    dateGridRender,
    allDayEventsRender,
  }: DayCalendarProps = $props();

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

  // 根滚动视口（对齐 Semi：dom 即根 .calendar-day，overflow:auto）。初始滚到 scrollTop 偏移
  // （对齐 Semi componentDidMount: dom.scrollTop = props.scrollTop）。
  let rootEl = $state<HTMLDivElement | null>(null);
  $effect(() => {
    if (!rootEl) return;
    rootEl.scrollTop = scrollTop;
  });

  // --- Intl 格式化器（语言来自 LocaleProvider 的 loc().code） ---
  const localeCode = $derived(loc().code);
  const fullDateFmt = $derived(
    new Intl.DateTimeFormat(localeCode, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }),
  );
  const slotTimeFmt = $derived(new Intl.DateTimeFormat(localeCode, { hour: '2-digit', minute: '2-digit' }));

  // --- 全天/跨天事件桶 ---
  const allDayBucket = $derived(allDayEventMap(events));
  const spanEvents = $derived(parseSpanEvents(allDayBucket, anchor, addDaysLocal(anchor, 1)));
  const allDayRows = $derived(Math.max(1, calcRowHeight(spanEvents)));

  const dayBucket = $derived(parseEvents(events).day);
  const positioned = $derived(getDailyEvents(dayBucket, anchor).day);

  const eventByKey = $derived.by(() => {
    const m = new Map<CalendarEvent['key'], CalendarEvent>();
    for (const e of events) m.set(e.key, e);
    return m;
  });
  function origEvent(key: CalendarEvent['key'], children: unknown): CalendarEvent {
    return eventByKey.get(key) ?? ({ key, children } as CalendarEvent);
  }

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

<!-- ===== day 视图（对齐 Semi dayCalendar：根无 role）===== -->
<div class={['cd-calendar-day', className]} bind:this={rootEl} style={rootStyle}>
  <div class="cd-calendar-day-sticky-top">
    {#if header}{@render header()}{/if}
    <!-- 全天区（对齐 Semi renderAllDay：div.all-day > ul.tag.all-day-tag.sticky-left + div.all-day-content > ul.event-items） -->
    <div class="cd-calendar-all-day" style:height={allDayEventsRender ? undefined : `${allDayRows}em`}>
      <ul class="cd-calendar-tag cd-calendar-all-day-tag cd-calendar-day-sticky-left">
        <span>{loc().t('Calendar.allDay')}</span>
      </ul>
      <div class="cd-calendar-all-day-content" role="gridcell">
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
  <div class="cd-calendar-day-scroll-wrapper">
    <div class="cd-calendar-day-scroll" bind:clientHeight={scrollContentHeight}>
      <TimeCol {hourLabel} variant="day" />
      <DayCol
        displayValue={anchor}
        dateLabel={fullDateFmt.format(anchor)}
        events={positioned}
        scrollHeight={scrollContentHeight}
        {showCurrTime}
        isWeekend={markWeekend && isWeekend(anchor)}
        {minEventHeight}
        {dateGridRender}
        onSlotClick={emitTimeClick}
        {slotLabel}
        {eventContent}
        {origEvent}
        {now}
      />
    </div>
  </div>
</div>

<style>
  /* ul/li reset 用 :where() 保持 0 特异性，避免压过组件自身 class 的 padding（如 tag padding-right）。 */
  .cd-calendar-day :global(:where(ul, li)) {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  /* sticky 顶部（对齐 Semi -sticky-top：物理属性 top/left/right） */
  .cd-calendar-day-sticky-top {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: var(--cd-calendar-z-stickytop);
    background: var(--cd-calendar-color-sticky-bg);
  }

  /* 对齐 Semi .calendar-day { overflow: auto }（根滚动容器）。 */
  .cd-calendar-day {
    overflow: auto;
  }

  /* sticky 左列（时间列 / tag 列，对齐 Semi -sticky-left：物理属性 left，RTL 单独覆盖） */
  .cd-calendar-day-sticky-left {
    position: sticky;
    left: 0;
    z-index: var(--cd-calendar-z-stickyleft);
    background: var(--cd-calendar-color-sticky-bg);
  }

  /* tag（全天标签列）——逐字对齐 Semi .tag { font-size-regular; min-width:70px; color:day-text }。
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

  /* 全天区（对齐 Semi .all-day） */
  .cd-calendar-all-day {
    display: flex;
    flex: 1 1 auto;
    border-bottom: 1px solid var(--cd-calendar-color-day-border);
  }
  .cd-calendar-all-day-content {
    position: relative;
    display: flex;
    flex: 1 0 auto;
    height: 100%;
    min-height: var(--cd-calendar-height-allday);
    min-width: calc(var(--cd-calendar-col-count, 1) * var(--cd-calendar-width-day-grid));
  }
  .cd-calendar-all-day .cd-calendar-event-items {
    position: absolute;
    left: 0;
    right: 0;
    width: 100%;
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

  /* 滚动区容器高度（对齐 Semi -scroll-wrapper：100% - 表头/全天区高，约束滚动区不撑破容器） */
  .cd-calendar-day-scroll-wrapper {
    height: var(--cd-calendar-height-day-scroll-wrapper);
  }
  /* 滚动内容区（对齐 Semi -scroll：无自身 overflow，滚动由根 .calendar-day 承担） */
  .cd-calendar-day-scroll {
    display: flex;
    flex: 1 1 auto;
    position: relative;
    align-items: flex-start;
  }

  /* —— RTL（逐条对齐 Semi calendar/rtl.scss）——
     本组件全部用物理属性（left/right 等，对齐 Semi calendar.scss），
     故 RTL 下逐条显式覆盖为镜像值，不依赖逻辑属性自动翻转。 */
  :global(.cd-rtl) .cd-calendar-day {
    direction: rtl;
  }
  :global(.cd-rtl) .cd-calendar-day-sticky-left {
    left: auto;
    right: 0;
  }
  :global(.cd-rtl) .cd-calendar-all-day-tag {
    text-align: left;
    padding-right: 0;
    padding-left: var(--cd-calendar-spacing-allday-tag-padding-right);
  }
</style>
