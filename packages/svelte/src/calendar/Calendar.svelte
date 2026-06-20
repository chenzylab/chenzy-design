<!--
  Calendar — see specs/components/show/Calendar.spec.md
  月/周视图日历：日格网格 + 事件展示与 +N 折叠，today/selected/outside/weekend/disabled 态。
  mode='month'(6×7) | 'week'(1×7)；selectionMode='single'(选中日) | 'range'(范围选择，起止+区间高亮+hover 预览)。
  受控 value(锚点)/selectedDate/rangeValue 不回写，仅 onChange/onSelect/onRangeChange/onDateClick/onMoreClick 通知。
  复用 @chenzy-design/core 的纯日期/分组算法（getMonthGrid/getWeekGrid/addMonths/addWeeks…），不重复实现。
  TODO(延后): day 视图、时间轴、弹层、虚拟化、完整 roving 焦点、i18n LocaleProvider。
-->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import {
    getMonthGrid,
    getWeekGrid,
    weekdayOrder,
    isSameDay,
    startOfDay,
    addMonths,
    addWeeks,
    groupEventsByDays,
    dayKey,
    isPastDay,
    type CalendarEvent,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;
  type Mode = 'month' | 'week';
  type SelectionMode = 'single' | 'range';
  type RangeValue = [Date, Date];

  interface Props {
    value?: Date;
    defaultValue?: Date;
    mode?: Mode;
    selectionMode?: SelectionMode;
    events?: CalendarEvent[];
    weekStartsOn?: WeekStart;
    maxEventsPerDay?: number;
    weekendDays?: number[];
    markWeekend?: boolean;
    disabledDate?: (date: Date) => boolean;
    selectedDate?: Date;
    defaultSelectedDate?: Date;
    rangeValue?: RangeValue | null;
    defaultRangeValue?: RangeValue | null;
    locale?: string;
    onChange?: (info: { value: Date }) => void;
    onSelect?: (info: { date: Date }) => void;
    onRangeChange?: (info: { range: RangeValue }) => void;
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
    mode = 'month',
    selectionMode = 'single',
    events = [],
    weekStartsOn = 0,
    maxEventsPerDay = 3,
    weekendDays = [0, 6],
    markWeekend = true,
    disabledDate,
    selectedDate,
    defaultSelectedDate,
    rangeValue,
    defaultRangeValue,
    locale = 'zh-CN',
    onChange,
    onSelect,
    onRangeChange,
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

  // --- 选中范围 rangeValue：受控不回写 (红线 #1) ---
  function normRange(r: RangeValue | null | undefined): RangeValue | null {
    if (!r) return null;
    const a = startOfDay(r[0]);
    const b = startOfDay(r[1]);
    return a.getTime() <= b.getTime() ? [a, b] : [b, a];
  }
  const isRangeControlled = $derived(rangeValue !== undefined);
  let innerRange = $state<RangeValue | null>(untrack(() => normRange(defaultRangeValue)));
  const currentRange = $derived(
    isRangeControlled ? normRange(rangeValue) : innerRange,
  );

  // --- range 选择状态机：'start'=待选起点；'end'=已选起点待选终点 ---
  let phase = $state<'start' | 'end'>('start');
  let pendingStart = $state<Date | null>(null);
  let previewEnd = $state<Date | null>(null);

  // --- 网格与分组：全部从 props/本地 $state 派生 (红线 #2) ---
  const cells = $derived(
    mode === 'week'
      ? getWeekGrid(currentValue, weekStartsOn)
      : getMonthGrid(currentValue, weekStartsOn),
  );
  const weeks = $derived(
    mode === 'week'
      ? [cells]
      : Array.from({ length: 6 }, (_, i) => cells.slice(i * 7, (i + 1) * 7)),
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
  // week 模式标题：本周首日 ~ 末日（同月则只展示一次月份）
  const rangeTitleFormatter = $derived(
    new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }),
  );
  const dayTitleFormatter = $derived(new Intl.DateTimeFormat(locale, { day: 'numeric' }));
  const weekTitle = $derived.by(() => {
    const first = cells[0]?.date;
    const last = cells[cells.length - 1]?.date;
    if (!first || !last) return '';
    const startText = rangeTitleFormatter.format(first);
    const endText =
      first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()
        ? dayTitleFormatter.format(last)
        : rangeTitleFormatter.format(last);
    return `${startText} – ${endText}`;
  });
  const title = $derived(mode === 'week' ? weekTitle : titleFormatter.format(currentValue));

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
    setAnchor(mode === 'week' ? addWeeks(currentValue, -1) : addMonths(currentValue, -1));
  }
  function goNext() {
    setAnchor(mode === 'week' ? addWeeks(currentValue, 1) : addMonths(currentValue, 1));
  }
  function goToday() {
    setAnchor(new Date());
  }

  function setSelected(date: Date) {
    if (!isSelectedControlled) innerSelected = date;
    onSelect?.({ date });
  }

  function setRange(next: RangeValue) {
    if (!isRangeControlled) innerRange = next;
    onRangeChange?.({ range: next });
  }

  function isDisabled(date: Date): boolean {
    return disabledDate?.(date) ?? false;
  }

  // range 选择：点第一天设起、第二天设止（排序后提交）
  function onRangeActivate(date: Date) {
    const day = startOfDay(date);
    if (phase === 'start') {
      pendingStart = day;
      previewEnd = day;
      phase = 'end';
      return;
    }
    const a = pendingStart ?? day;
    const next: RangeValue =
      a.getTime() <= day.getTime() ? [a, day] : [day, a];
    setRange(next);
    phase = 'start';
    pendingStart = null;
    previewEnd = null;
  }

  function onCellActivate(date: Date) {
    if (isDisabled(date)) return;
    onDateClick?.({ date });
    if (selectionMode === 'range') {
      onRangeActivate(date);
    } else {
      setSelected(date);
    }
  }

  function onCellHover(date: Date) {
    if (selectionMode === 'range' && phase === 'end' && !isDisabled(date)) {
      previewEnd = startOfDay(date);
    }
  }

  function onCellKeydown(e: KeyboardEvent, date: Date) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCellActivate(date);
    }
  }

  // --- range 区间端点 / 区间内判定（纯派生，红线 #2） ---
  const rangeStart = $derived(phase === 'end' ? pendingStart : (currentRange?.[0] ?? null));
  const rangeEnd = $derived(phase === 'end' ? previewEnd : (currentRange?.[1] ?? null));
  const span = $derived.by<[number, number] | null>(() => {
    if (!rangeStart || !rangeEnd) return null;
    const ta = rangeStart.getTime();
    const tb = rangeEnd.getTime();
    return ta <= tb ? [ta, tb] : [tb, ta];
  });

  function isRangeEdge(date: Date): boolean {
    if (selectionMode !== 'range') return false;
    return isSameDay(date, rangeStart) || isSameDay(date, rangeEnd);
  }
  function isInRange(date: Date): boolean {
    if (selectionMode !== 'range' || !span) return false;
    const t = startOfDay(date).getTime();
    return t > span[0] && t < span[1];
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
    if (selectionMode === 'range') return false;
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
    <div class="cd-calendar__title">{title}</div>
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

  <div class="cd-calendar__grid" role="grid" aria-label={ariaLabel ?? title}>
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
          {@const rangeEdgeCell = isRangeEdge(date)}
          {@const inRangeCell = isInRange(date)}
          {@const dayData = dayMap.get(dayKey(date))}
          {@const visible = dayData?.visible ?? []}
          {@const total = dayData?.total ?? []}
          {@const overflow = dayData?.overflow ?? 0}
          <div
            class="cd-calendar__cell"
            class:cd-calendar__cell--week={mode === 'week'}
            class:cd-calendar__cell--today={isToday}
            class:cd-calendar__cell--selected={selected}
            class:cd-calendar__cell--range-edge={rangeEdgeCell}
            class:cd-calendar__cell--in-range={inRangeCell}
            class:cd-calendar__cell--outside={outside}
            class:cd-calendar__cell--weekend={weekend}
            class:cd-calendar__cell--disabled={disabled}
            class:cd-calendar__cell--past={past}
            role="gridcell"
            tabindex={disabled ? undefined : 0}
            aria-selected={selected || rangeEdgeCell || undefined}
            aria-disabled={disabled || undefined}
            aria-current={isToday ? 'date' : undefined}
            onclick={() => onCellActivate(date)}
            onkeydown={(e) => onCellKeydown(e, date)}
            onpointerenter={() => onCellHover(date)}
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
  /* range 区间内：浅底连续填充 */
  .cd-calendar__cell--in-range {
    background: var(--cd-calendar-range-bg, var(--cd-calendar-today-bg));
  }
  /* range 端点：实心边框高亮（起止） */
  .cd-calendar__cell--range-edge {
    background: var(--cd-calendar-range-edge-bg, var(--cd-calendar-today-bg));
    box-shadow: inset 0 0 0 2px var(--cd-calendar-selected-border);
  }
  /* week 模式：单行更高，事件区有更多展示空间 */
  .cd-calendar__cell--week {
    min-block-size: var(--cd-calendar-week-cell-min-h, calc(var(--cd-calendar-cell-min-h) * 3));
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
