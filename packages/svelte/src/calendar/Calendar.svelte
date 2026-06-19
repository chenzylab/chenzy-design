<!--
  Calendar (month-view subset) — see specs/components/show/Calendar.spec.md
  月视图日历：6×7 日格网格 + 事件展示与 +N 折叠，today/selected/outside/weekend/disabled 态、月份导航。
  受控 value(锚点)/selectedDate 不回写，仅 onChange/onSelect/onDateClick/onMoreClick 通知。
  复用 @chenzy-design/core 的纯日期/分组算法，不重复实现。
  TODO(延后): week/day/range 视图、时间轴、弹层、虚拟化、完整 roving 焦点、i18n LocaleProvider。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    getMonthGrid,
    weekdayOrder,
    isSameDay,
    addMonths,
    groupEventsByDays,
    dayKey,
    isPastDay,
    type CalendarEvent,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

  interface Props {
    value?: Date;
    defaultValue?: Date;
    events?: CalendarEvent[];
    weekStartsOn?: WeekStart;
    maxEventsPerDay?: number;
    weekendDays?: number[];
    markWeekend?: boolean;
    disabledDate?: (date: Date) => boolean;
    selectedDate?: Date;
    defaultSelectedDate?: Date;
    locale?: string;
    onChange?: (info: { value: Date }) => void;
    onSelect?: (info: { date: Date }) => void;
    onDateClick?: (info: { date: Date }) => void;
    onMoreClick?: (info: { date: Date; events: CalendarEvent[] }) => void;
    dateCell?: Snippet<
      [{ date: Date; events: CalendarEvent[]; isToday: boolean; isOutside: boolean; disabled: boolean }]
    >;
    event?: Snippet<[{ event: CalendarEvent }]>;
    ariaLabel?: string;
  }

  let {
    value,
    defaultValue,
    events = [],
    weekStartsOn = 0,
    maxEventsPerDay = 3,
    weekendDays = [0, 6],
    markWeekend = true,
    disabledDate,
    selectedDate,
    defaultSelectedDate,
    locale = 'zh-CN',
    onChange,
    onSelect,
    onDateClick,
    onMoreClick,
    dateCell,
    event,
    ariaLabel,
  }: Props = $props();

  const loc = useLocale();

  // 一次性常量：今天（render 用于派生 today/past 态，不放 $state 反复 new）
  const today = new Date();

  // --- 锚点 value：受控不回写 (红线 #1) ---
  function initValue(): Date {
    return defaultValue ?? new Date();
  }
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state<Date>(initValue());
  const currentValue = $derived(isValueControlled ? (value as Date) : innerValue);

  // --- 选中日 selectedDate：受控不回写 (红线 #1) ---
  function initSelected(): Date | null {
    return defaultSelectedDate ?? null;
  }
  const isSelectedControlled = $derived(selectedDate !== undefined);
  let innerSelected = $state<Date | null>(initSelected());
  const currentSelected = $derived(
    isSelectedControlled ? (selectedDate as Date) : innerSelected,
  );

  // --- 网格与分组：全部从 props/本地 $state 派生 (红线 #2) ---
  const cells = $derived(getMonthGrid(currentValue, weekStartsOn));
  const weeks = $derived(
    Array.from({ length: 6 }, (_, i) => cells.slice(i * 7, (i + 1) * 7)),
  );
  const dayMap = $derived(
    groupEventsByDays(
      events,
      cells.map((c) => c.date),
      maxEventsPerDay,
    ),
  );

  // --- Intl 格式化 ---
  const titleFormatter = $derived(
    new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }),
  );
  const weekdayFormatter = $derived(new Intl.DateTimeFormat(locale, { weekday: 'short' }));
  const monthTitle = $derived(titleFormatter.format(currentValue));

  // 星期表头：用首周 7 格的 date 生成名称（顺序与 weekStartsOn 一致）
  const weekdayOrderList = $derived(weekdayOrder(weekStartsOn));
  const weekdayNames = $derived(
    cells.slice(0, 7).map((c) => weekdayFormatter.format(c.date)),
  );

  // --- 状态写入：仅非受控写 inner，受控只回调 (红线 #1) ---
  function setAnchor(next: Date) {
    if (!isValueControlled) innerValue = next;
    onChange?.({ value: next });
  }

  function goPrev() {
    setAnchor(addMonths(currentValue, -1));
  }
  function goNext() {
    setAnchor(addMonths(currentValue, 1));
  }
  function goToday() {
    setAnchor(new Date());
  }

  function setSelected(date: Date) {
    if (!isSelectedControlled) innerSelected = date;
    onSelect?.({ date });
  }

  function isDisabled(date: Date): boolean {
    return disabledDate?.(date) ?? false;
  }

  function onCellActivate(date: Date) {
    if (isDisabled(date)) return;
    onDateClick?.({ date });
    setSelected(date);
  }

  function onCellKeydown(e: KeyboardEvent, date: Date) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCellActivate(date);
    }
  }

  function onMore(date: Date, total: CalendarEvent[]) {
    onMoreClick?.({ date, events: total });
  }

  function dayNumber(date: Date): number {
    return date.getDate();
  }

  function isWeekendDay(date: Date): boolean {
    return markWeekend && weekendDays.includes(date.getDay());
  }

  function isTodayDay(date: Date): boolean {
    return isSameDay(date, today);
  }

  function isSelectedDay(date: Date): boolean {
    return isSameDay(date, currentSelected);
  }
</script>

<div class="cd-calendar">
  <div class="cd-calendar__toolbar">
    <button
      type="button"
      class="cd-calendar__nav"
      aria-label={loc().t('Calendar.prev')}
      onclick={goPrev}
    >
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
        <path
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M10 3L5 8l5 5"
        />
      </svg>
    </button>
    <button type="button" class="cd-calendar__today" onclick={goToday}>{loc().t('Calendar.today')}</button>
    <div class="cd-calendar__title">{monthTitle}</div>
    <button
      type="button"
      class="cd-calendar__nav"
      aria-label={loc().t('Calendar.next')}
      onclick={goNext}
    >
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
        <path
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 3l5 5-5 5"
        />
      </svg>
    </button>
  </div>

  <div class="cd-calendar__grid" role="grid" aria-label={ariaLabel ?? monthTitle}>
    <div class="cd-calendar__row cd-calendar__row--head" role="row">
      {#each weekdayNames as name, i (weekdayOrderList[i])}
        {@const weekend = markWeekend && weekendDays.includes(weekdayOrderList[i] as number)}
        <div
          class="cd-calendar__weekday"
          class:cd-calendar__weekday--weekend={weekend}
          role="columnheader"
        >
          {name}
        </div>
      {/each}
    </div>

    {#each weeks as week, wi (wi)}
      <div class="cd-calendar__row" role="row">
        {#each week as cell (dayKey(cell.date))}
          {@const date = cell.date}
          {@const outside = !cell.inMonth}
          {@const disabled = isDisabled(date)}
          {@const isToday = isTodayDay(date)}
          {@const selected = isSelectedDay(date)}
          {@const weekend = isWeekendDay(date)}
          {@const past = isPastDay(date, today)}
          {@const dayData = dayMap.get(dayKey(date))}
          {@const visible = dayData?.visible ?? []}
          {@const total = dayData?.total ?? []}
          {@const overflow = dayData?.overflow ?? 0}
          <div
            class="cd-calendar__cell"
            class:cd-calendar__cell--today={isToday}
            class:cd-calendar__cell--selected={selected}
            class:cd-calendar__cell--outside={outside}
            class:cd-calendar__cell--weekend={weekend}
            class:cd-calendar__cell--disabled={disabled}
            class:cd-calendar__cell--past={past}
            role="gridcell"
            tabindex={disabled ? undefined : 0}
            aria-selected={selected || undefined}
            aria-disabled={disabled || undefined}
            aria-current={isToday ? 'date' : undefined}
            onclick={() => onCellActivate(date)}
            onkeydown={(e) => onCellKeydown(e, date)}
          >
            {#if dateCell}
              {@render dateCell({ date, events: total, isToday, isOutside: outside, disabled })}
            {:else}
              <div class="cd-calendar__date">{dayNumber(date)}</div>
              <div class="cd-calendar__events">
                {#each visible as ev (ev.key)}
                  {#if event}
                    {@render event({ event: ev })}
                  {:else}
                    <div
                      class="cd-calendar__event"
                      class:cd-calendar__event--disabled={ev.disabled}
                      style:--cd-calendar-event-accent={ev.color ?? 'var(--cd-calendar-event-default-bg)'}
                      title={ev.title}
                    >
                      <span class="cd-calendar__event-bar" aria-hidden="true"></span>
                      <span class="cd-calendar__event-title">{ev.title}</span>
                    </div>
                  {/if}
                {/each}
                {#if overflow > 0}
                  <button
                    type="button"
                    class="cd-calendar__more"
                    onclick={(e) => {
                      e.stopPropagation();
                      onMore(date, total);
                    }}
                  >
                    {loc().t('Calendar.moreCount', { count: overflow })}
                  </button>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .cd-calendar {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-2);
    color: var(--cd-calendar-text);
    background: var(--cd-calendar-bg);
    border: 1px solid var(--cd-calendar-border);
    border-radius: var(--cd-calendar-radius);
    font-size: var(--cd-font-size-body);
  }

  .cd-calendar__toolbar {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    padding: var(--cd-spacing-2) var(--cd-spacing-3);
    background: var(--cd-calendar-header-bg);
    border-bottom: 1px solid var(--cd-calendar-border);
    border-start-start-radius: var(--cd-calendar-radius);
    border-start-end-radius: var(--cd-calendar-radius);
  }

  .cd-calendar__title {
    flex: 1 1 auto;
    font-weight: 600;
  }

  .cd-calendar__nav,
  .cd-calendar__today {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--cd-spacing-1) var(--cd-spacing-2);
    color: inherit;
    background: transparent;
    border: 1px solid var(--cd-calendar-border);
    border-radius: var(--cd-calendar-radius);
    cursor: pointer;
    font: inherit;
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-calendar__nav:hover,
  .cd-calendar__today:hover {
    background: var(--cd-calendar-cell-bg-hover);
  }
  .cd-calendar__nav:focus-visible,
  .cd-calendar__today:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--cd-focus-ring);
  }

  .cd-calendar__grid {
    display: flex;
    flex-direction: column;
  }

  .cd-calendar__row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }

  .cd-calendar__weekday {
    padding: var(--cd-spacing-1);
    color: var(--cd-calendar-text-secondary);
    text-align: center;
    font-weight: 500;
    border-block-end: 1px solid var(--cd-calendar-border);
  }
  .cd-calendar__weekday--weekend {
    background: var(--cd-calendar-weekend-bg);
  }

  .cd-calendar__cell {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-1);
    min-block-size: var(--cd-calendar-cell-min-h);
    padding: var(--cd-spacing-1);
    border-inline-end: 1px solid var(--cd-calendar-border);
    border-block-end: 1px solid var(--cd-calendar-border);
    cursor: pointer;
    outline: none;
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-calendar__cell:hover {
    background: var(--cd-calendar-cell-bg-hover);
  }
  .cd-calendar__cell:focus-visible {
    box-shadow: inset 0 0 0 2px var(--cd-focus-ring);
  }

  .cd-calendar__cell--weekend {
    background: var(--cd-calendar-weekend-bg);
  }
  .cd-calendar__cell--today {
    background: var(--cd-calendar-today-bg);
  }
  .cd-calendar__cell--today .cd-calendar__date {
    color: var(--cd-calendar-today-fg);
    font-weight: 700;
  }
  .cd-calendar__cell--selected {
    box-shadow: inset 0 0 0 2px var(--cd-calendar-selected-border);
  }
  .cd-calendar__cell--outside .cd-calendar__date {
    color: var(--cd-calendar-text-secondary);
  }
  .cd-calendar__cell--past .cd-calendar__date {
    opacity: 0.6;
  }
  .cd-calendar__cell--disabled {
    background: var(--cd-calendar-disabled-bg);
    cursor: not-allowed;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 4px,
      var(--cd-calendar-disabled-bg) 4px,
      var(--cd-calendar-disabled-bg) 8px
    );
  }
  .cd-calendar__cell--disabled:hover {
    background-color: var(--cd-calendar-disabled-bg);
  }

  .cd-calendar__date {
    align-self: flex-end;
    font-size: var(--cd-font-size-body);
    line-height: 1.2;
  }

  .cd-calendar__events {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-inline-size: 0;
  }

  .cd-calendar__event {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-1);
    min-inline-size: 0;
    padding-block: 1px;
    padding-inline: var(--cd-spacing-1);
    color: var(--cd-calendar-text);
    background: var(--cd-calendar-cell-bg-hover);
    border-radius: var(--cd-calendar-radius);
    font-size: 0.75rem;
    line-height: 1.4;
  }
  .cd-calendar__event--disabled {
    opacity: 0.5;
  }
  .cd-calendar__event-bar {
    flex: 0 0 auto;
    inline-size: 3px;
    align-self: stretch;
    min-block-size: 0.9em;
    background: var(--cd-calendar-event-accent, var(--cd-calendar-event-default-bg));
    border-radius: 2px;
  }
  .cd-calendar__event-title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .cd-calendar__more {
    align-self: flex-start;
    padding: 0;
    color: var(--cd-calendar-more-color);
    background: transparent;
    border: none;
    cursor: pointer;
    font: inherit;
    font-size: var(--cd-font-size-caption, 0.85em);
  }
  .cd-calendar__more:hover {
    text-decoration: underline;
  }
  .cd-calendar__more:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--cd-focus-ring);
    border-radius: var(--cd-calendar-radius);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-calendar__cell,
    .cd-calendar__nav,
    .cd-calendar__today {
      transition: none;
    }
  }
</style>
