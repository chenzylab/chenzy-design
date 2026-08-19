<!--
  DayCol — day/week/range 视图共用的单日列，对齐 Semi `semi-ui/calendar/dayCol.tsx`。
  DOM：div.grid > div.grid-content > (curr line/circle + ul.grid-skeleton(25×2 半小时 li) + dateGridRender + ul.event-items)。
  从 Calendar.svelte 的 {#snippet dayCol(...)} 原样迁出，逻辑不变。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getPos, isSameDay, type CalendarEvent, type PositionedDayEvent } from '@chenzy-design/core';
  import { DAY_GRID_ROWS } from './constants.js';
  import type { DayColProps } from './types.js';

  let {
    displayValue,
    dateLabel,
    events,
    scrollHeight,
    showCurrTime = true,
    isWeekend = false,
    minEventHeight = Number.MIN_SAFE_INTEGER,
    dateGridRender,
    onSlotClick,
    slotLabel,
    eventContent,
    origEvent,
    now,
  }: DayColProps = $props();

  function emitTimeClick(halfIndex: number, e: Event) {
    onSlotClick?.(displayValue, halfIndex, e);
  }

  // 事件绝对定位样式（时间轴列内，对齐 Semi DayCol renderEvents）。
  function timedStyle(ev: PositionedDayEvent, h: number): string {
    const top = ev.startPos * h;
    const rawH = (ev.endPos - ev.startPos) * h;
    const eh = Math.max(minEventHeight, rawH);
    const left = typeof ev.left === 'number' ? `${ev.left}px` : ev.left;
    return `top:${top}px;height:${eh}px;left:${left};`;
  }

  const isNowColumn = $derived(isSameDay(displayValue, now));
  const currTimeTop = $derived(showCurrTime ? getPos(now) * scrollHeight : 0);
</script>

<div class="cd-calendar-grid" role="presentation">
  <div class="cd-calendar-grid-content" role="gridcell" aria-label={dateLabel}>
    {#if showCurrTime && isNowColumn}
      <div class="cd-calendar-grid-curr-circle" style:top={`${currTimeTop}px`}></div>
      <div class="cd-calendar-grid-curr-line" style:top={`${currTimeTop}px`}></div>
    {/if}
    <!-- 对齐 Semi dayCol renderGrid：25×2 个空 <li data-time onClick>，整点 li 有 row-line class。
         点击绑 li 本身（无 button 子元素）；li 加 role/tabindex/keydown 保留键盘可达。 -->
    <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
    <ul class="cd-calendar-grid-skeleton" class:cd-calendar-weekend={isWeekend} role="row">
      {#each { length: DAY_GRID_ROWS } as _, item (item)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li
          class="cd-calendar-grid-skeleton-row-line"
          data-time={`${String(item).padStart(2, '0')}:00:00`}
          role="button"
          tabindex="-1"
          aria-label={slotLabel(displayValue, item * 2)}
          onclick={(e) => emitTimeClick(item * 2, e)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emitTimeClick(item * 2, e); } }}
        ></li>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li
          data-time={`${String(item).padStart(2, '0')}:30:00`}
          role="button"
          tabindex="-1"
          aria-label={slotLabel(displayValue, item * 2 + 1)}
          onclick={(e) => emitTimeClick(item * 2 + 1, e)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emitTimeClick(item * 2 + 1, e); } }}
        ></li>
      {/each}
    </ul>
    {#if dateGridRender}
      {@const extra = dateGridRender(displayValue.toString(), displayValue)}
      {#if extra}{@render extra()}{/if}
    {/if}
    <ul class="cd-calendar-event-items">
      {#each events as ev (ev.key)}
        <li class="cd-calendar-event-item cd-calendar-event-day" style={timedStyle(ev, scrollHeight)}>
          {@render eventContent(origEvent(ev.key, ev.children))}
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
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

  /* week 列竖线（对齐 Semi .week .grid-skeleton li border-right，最后列不画） */
  :global(.cd-calendar-week) .cd-calendar-grid-skeleton li {
    border-right: 1px solid var(--cd-calendar-color-day-border);
  }
  :global(.cd-calendar-week) .cd-calendar-grid:last-child .cd-calendar-grid-content .cd-calendar-grid-skeleton li {
    border-right: 0;
  }
  /* 周末底色（对齐 Semi .calendar-weekend）：DayCol 内的 weekend 修饰类 */
  .cd-calendar-weekend {
    background: var(--cd-calendar-color-weekend-bg);
  }

  /* —— RTL（逐条对齐 Semi calendar/rtl.scss）—— */
  :global(.cd-rtl .cd-calendar-week) .cd-calendar-grid-skeleton li {
    border-right: 0;
    border-left: 1px solid var(--cd-calendar-color-day-border);
  }
  :global(.cd-rtl .cd-calendar-week)
    .cd-calendar-grid:last-child
    .cd-calendar-grid-content
    .cd-calendar-grid-skeleton li {
    border-left: 0;
  }
</style>
