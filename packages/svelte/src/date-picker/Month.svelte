<!--
  Month —— 对齐 Semi datePicker/month.tsx。
  DOM：div.MONTH role=grid aria-multiselectable
         > div.WEEKDAY role=row > div.-weekday-item role=columnheader ×7
         > div.WEEKS(style.height=weeksRowNum*36)
             > div.WEEK role=row ×N
                 > div.DAY role=gridcell tabindex(disabled?-1:0) aria-disabled/selected/label + title
                     > div.DAY-main > span{dayNumber}   （空日格：div.DAY tabindex=-1 > span）
  day 状态 → 19 个 DAY_* class（getDayStatus 合成）。renderDate/renderFullDate 走 snippet。
  a11y 只保留 Semi 有的：role=grid/row/columnheader/gridcell、aria-multiselectable、
  逐格 tabindex=0（非 activedescendant）、aria-disabled/aria-selected/aria-label/title。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';
  import { cssClasses, numbers } from './constants.js';
  import {
    createMonthState,
    getDayStatus,
    getTodayText,
    type MonthDayInfo,
    type DayStatus,
    type RangeInputFocus,
  } from './month-foundation.svelte.js';
  import type { WeekStartNumber } from './_utils/getDayOfWeek.js';

  interface Props {
    month: Date;
    selected?: Set<string>;
    rangeStart?: string;
    rangeEnd?: string;
    offsetRangeStart?: string;
    offsetRangeEnd?: string;
    hoverDay?: string;
    weekStartsOn?: WeekStartNumber;
    disabledDate?: (day: Date, options?: { rangeStart: string; rangeEnd: string; rangeInputFocus: RangeInputFocus }) => boolean;
    rangeInputFocus?: RangeInputFocus;
    focusRecords?: { rangeStart: boolean; rangeEnd: boolean };
    multiple?: boolean;
    weeksRowNum?: number;
    onDayClick?: (day: MonthDayInfo) => void;
    onDayHover?: (day?: MonthDayInfo) => void;
    /** 自定义日期数字渲染（对齐 Semi renderDate）。 */
    renderDate?: Snippet<[number | string, string]>;
    /** 自定义整日格渲染（对齐 Semi renderFullDate，替换 DAY-main 内容且不套状态 class）。 */
    renderFullDate?: Snippet<[number | string, string, DayStatus]>;
  }

  let {
    month,
    selected = new Set<string>(),
    rangeStart = '',
    rangeEnd = '',
    offsetRangeStart = '',
    offsetRangeEnd = '',
    hoverDay = '',
    weekStartsOn = numbers.WEEK_START_ON as WeekStartNumber,
    disabledDate,
    rangeInputFocus = false,
    focusRecords,
    multiple = false,
    weeksRowNum,
    onDayClick,
    onDayHover,
    renderDate,
    renderFullDate,
  }: Props = $props();

  const loc = useLocale();
  const prefixCls = cssClasses.PREFIX;

  const st = createMonthState(() => ({ month, weekStartsOn }));
  const todayText = getTodayText();

  // weekday 文案 i18n（key=Sun/Mon…，对齐 Semi locale.weeks[key]）。
  const weekdaysText = $derived(st.weekdays.map((key) => loc().t(`DatePicker.weeks.${key}`)));

  // weeksRowNum 显式传入时锁定高度（对齐 Semi：双面板行数不齐时对齐到较多者）。
  const rowNum = $derived(weeksRowNum ?? st.weeksRowNum);
  const weeksStyle = $derived(rowNum ? `height:${rowNum * numbers.WEEK_HEIGHT}px` : '');

  function dayStatusOf(day: MonthDayInfo): DayStatus {
    return getDayStatus({
      fullDate: day.fullDate,
      todayText,
      selected,
      disabledDate,
      rangeStart,
      rangeEnd,
      hoverDay,
      offsetRangeStart,
      offsetRangeEnd,
      rangeInputFocus,
      focusRecords,
    });
  }

  // dayStatus → DAY_* class 映射（对齐 Semi month.tsx dayCls，19 状态）。
  function dayClass(s: DayStatus): string {
    const c = cssClasses;
    return [
      c.DAY,
      s.isToday && c.DAY_TODAY,
      s.isInRange && c.DAY_IN_RANGE,
      s.isHover && c.DAY_HOVER,
      s.isSelected && c.DAY_SELECTED,
      s.isSelectedStart && c.DAY_SELECTED_START,
      s.isSelectedEnd && c.DAY_SELECTED_END,
      s.isDisabled && c.DAY_DISABLED,
      s.isHoverDayOffset && c.DAY_HOVER_DAY,
      s.isInOffsetRange && c.DAY_IN_OFFSET_RANGE,
      s.isHoverInOffsetRange && c.DAY_SELECTED_RANGE_HOVER,
      s.isOffsetRangeStart && c.DAY_OFFSET_RANGE_START,
      s.isOffsetRangeEnd && c.DAY_OFFSET_RANGE_END,
      s.isSelectedStartAfterHover && c.DAY_SELECTED_START_AFTER_HOVER,
      s.isSelectedEndBeforeHover && c.DAY_SELECTED_END_BEFORE_HOVER,
      s.isHoverDayInStartSelection && c.DAY_HOVER_DAY_BEFORE_RANGE,
      s.isHoverDayInEndSelection && c.DAY_HOVER_DAY_AFTER_RANGE,
      s.isHoverDayAroundOneSelected && c.DAY_HOVER_DAY_AROUND_SINGLE_SELECTED,
    ]
      .filter(Boolean)
      .join(' ');
  }
</script>

<div class={cssClasses.MONTH} role="grid" aria-multiselectable={multiple || undefined}>
  <div class={cssClasses.WEEKDAY} role="row">
    {#each weekdaysText as text, i (text + i)}
      <div class={`${prefixCls}-weekday-item`} role="columnheader">{text}</div>
    {/each}
  </div>
  <div class={cssClasses.WEEKS} style={weeksStyle}>
    {#each st.weeks as week, weekIndex (weekIndex)}
      <div class={cssClasses.WEEK} role="row">
        {#each week as day, dayIndex (String(day.dayNumber) + dayIndex)}
          {#if !day.fullDate}
            <div class={cssClasses.DAY} role="gridcell" tabindex={-1}><span></span></div>
          {:else}
            {@const s = dayStatusOf(day)}
            <!-- 对齐 Semi month.tsx：日格用 div role=gridcell + onclick，键盘导航在网格层统一处理（roving tabindex），故不加 keydown。 -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
              class={renderFullDate ? cssClasses.DAY : dayClass(s)}
              role="gridcell"
              tabindex={s.isDisabled ? -1 : 0}
              aria-disabled={s.isDisabled || undefined}
              aria-selected={s.isSelected || undefined}
              aria-label={day.fullDate}
              title={day.fullDate}
              onclick={() => !s.isDisabled && onDayClick?.(day)}
              onmouseenter={() => onDayHover?.(day)}
              onmouseleave={() => onDayHover?.()}
            >
              {#if renderFullDate}
                {@render renderFullDate(day.dayNumber, day.fullDate, s)}
              {:else}
                <div class={`${cssClasses.DAY}-main`}>
                  {#if renderDate}{@render renderDate(day.dayNumber, day.fullDate)}{:else}<span>{day.dayNumber}</span>{/if}
                </div>
              {/if}
            </div>
          {/if}
        {/each}
      </div>
    {/each}
  </div>
</div>
