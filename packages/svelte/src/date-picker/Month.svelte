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
  // 用 CSS calc 而非 JS 常量：日格高在 compact 下由 --cd-width-date-picker-day 覆写，
  // JS 算死 36 会让 compact 面板高度不跟随（对齐 Semi 的 scss 变量驱动）。
  const weeksStyle = $derived(
    rowNum ? `height:calc(${rowNum} * var(--cd-width-date-picker-day, ${numbers.WEEK_HEIGHT}px))` : '',
  );

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

<style>
  /* 月面板 —— 对齐 Semi datePicker.scss &-month/&-weekday/&-weeks/&-week/&-day。
     class 为动态字符串（constants），故用 :global 打洞（本库既定 scoped+:global）。 */
  :global(.cd-datepicker-month) {
    /* 单月面板宽 = 日格 36 × 7 */
    width: calc(var(--cd-width-date-picker-day, 36px) * 7);
    box-sizing: content-box;
    /* 对齐 Semi datePicker.scss `padding: $spacing-datepicker_month-padding(=spacing-base 16px); padding-top: 0`。 */
    padding: var(--cd-spacing-base, 16px);
    padding-top: 0;
  }

  /* 星期表头行 */
  :global(.cd-datepicker-weekday) {
    font-size: var(--cd-font-size-small, 12px);
    line-height: var(--cd-line-height-small, 16px);
    font-weight: var(--cd-font-weight-bold, 600);
    color: var(--cd-color-date-picker-day-text-default);
    border-bottom: var(--cd-width-date-picker-border, 1px) solid
      var(--cd-color-date-picker-border-bg-default);
  }
  :global(.cd-datepicker-weekday-item) {
    width: var(--cd-width-date-picker-day, 36px);
    height: var(--cd-width-date-picker-day, 36px);
    line-height: var(--cd-width-date-picker-day, 36px);
    text-align: center;
    display: inline-block;
  }

  :global(.cd-datepicker-weeks) {
    color: var(--cd-color-date-picker-date-text-default);
    /* 行内 height 只表达「N 行 × 日格高」的内容高；compact 下的 padding-top 需额外撑开，
       故显式 content-box（默认值，写出来防被上层 border-box 继承压缩掉最后一行）。 */
    box-sizing: content-box;
  }
  :global(.cd-datepicker-week) {
    display: flex;
    align-items: center;
  }

  /* 日格外框（36×36 点击区）+ 内层 day-main（32×32 圆角高亮区） */
  :global(.cd-datepicker-day) {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--cd-width-date-picker-day, 36px);
    height: var(--cd-width-date-picker-day, 36px);
    cursor: pointer;
  }
  :global(.cd-datepicker-day-main) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--cd-width-date-picker-day-main, 32px);
    height: var(--cd-width-date-picker-day-main, 32px);
    margin: 0 auto;
    box-sizing: border-box;
    border-radius: var(--cd-radius-date-picker-day-main, var(--cd-radius-small, 3px));
  }
  /* renderDate 里包 Tooltip 时，让触发包裹撑满整个 day-main。
     Semi 的 Tooltip 对单一有效元素走 cloneElement **直接把事件挂到该元素上**、
     不额外包一层（tooltip/index.tsx:863），所以用户写的
     `<div style="width:100%;height:100%">` 的 100% 是相对 day-main 解析的。
     Svelte 无法克隆 snippet 产物，触发包裹是结构性的；不撑满时用户 div 的
     100% 会相对这个 shrink-wrap 的 inline-block 解析（实测只有 7.7px），
     日格大片区域裸露 → 悬停命中的是外层带 title 的 gridcell，
     冒出浏览器原生 `2026-07-01` 提示（Semi 没有）。 */
  /* 结构是 day-main > span.cd-tooltip > span.cd-tooltip__trigger > 用户元素，
     两层都要撑满，100% 才能一路解析到 day-main 的 32×32。 */
  :global(.cd-datepicker-day-main) > :global(.cd-tooltip),
  :global(.cd-datepicker-day-main) :global(.cd-tooltip__trigger) {
    display: flex;
    inline-size: 100%;
    block-size: 100%;
  }
  :global(.cd-datepicker-day-main:hover) {
    background-color: var(--cd-color-date-picker-date-bg-hover);
  }

  /* today：浅底 + 主色 + 粗体（非下划线，对齐 Semi） */
  :global(.cd-datepicker-day-today .cd-datepicker-day-main) {
    color: var(--cd-color-date-picker-date-today-text-default, var(--cd-color-primary));
    background-color: var(--cd-color-date-picker-date-bg-hover);
    font-weight: var(--cd-font-weight-bold, 600);
  }

  /* in-range/hover 连续条：内层拉宽到 36 消隙 + 直角 */
  :global(.cd-datepicker-day-inrange .cd-datepicker-day-main),
  :global(.cd-datepicker-day-inhover .cd-datepicker-day-main),
  :global(.cd-datepicker-day-inoffsetrange .cd-datepicker-day-main),
  :global(.cd-datepicker-day-hoverday .cd-datepicker-day-main),
  :global(.cd-datepicker-day-selectedrange-hover .cd-datepicker-day-main),
  :global(.cd-datepicker-day-hoverday-around-singleselected .cd-datepicker-day-main),
  :global(.cd-datepicker-day-hoverday-inrange .cd-datepicker-day-main) {
    border-radius: 0;
    margin-left: 0;
    margin-right: 0;
    width: var(--cd-width-date-picker-day, 36px);
  }

  /* range 端点：仅外侧半圆角 + 拉宽 34（36 - 2 marginX） */
  :global(.cd-datepicker-day-selected-start .cd-datepicker-day-main),
  :global(.cd-datepicker-day-offsetrange-start .cd-datepicker-day-main) {
    width: calc(var(--cd-width-date-picker-day, 36px) - 2px);
    margin-left: 2px;
    margin-right: 0;
    border-radius: var(--cd-radius-date-picker-day-main, 3px) 0 0
      var(--cd-radius-date-picker-day-main, 3px);
  }
  :global(.cd-datepicker-day-selected-end .cd-datepicker-day-main),
  :global(.cd-datepicker-day-offsetrange-end .cd-datepicker-day-main) {
    width: calc(var(--cd-width-date-picker-day, 36px) - 2px);
    margin-right: 2px;
    margin-left: 0;
    border-radius: 0 var(--cd-radius-date-picker-day-main, 3px)
      var(--cd-radius-date-picker-day-main, 3px) 0;
  }

  /* compact 下的圆角/宽度已由本库变量覆写机制自动跟随（.cd-datepicker-compact 覆写
     --cd-radius-date-picker-day-main: 4px 与 --cd-width-date-picker-day: 28px，见
     DatePicker.svelte 根 compact 规则），上面这条通用规则无需为 compact 单独重复一份
     ——不同于 Semi 用字面量分别写 default/compact 两套选择器。 */

  /* range 悬停高亮背景（对齐 Semi：inRangeHover=fill-0 / hoverDay=fill-1 /
     hoverday_range=primary-light-active / selectedRange-hover=primary-light-hover） */
  :global(.cd-datepicker-day-inoffsetrange .cd-datepicker-day-main),
  :global(.cd-datepicker-day-offsetrange-start .cd-datepicker-day-main),
  :global(.cd-datepicker-day-offsetrange-end .cd-datepicker-day-main) {
    background-color: var(--cd-color-fill-0);
  }
  :global(.cd-datepicker-day-hoverday .cd-datepicker-day-main),
  :global(.cd-datepicker-day-hoverday-offset .cd-datepicker-day-main) {
    background-color: var(--cd-color-fill-1);
  }
  :global(.cd-datepicker-day-inrange .cd-datepicker-day-main),
  :global(.cd-datepicker-day-inhover .cd-datepicker-day-main) {
    background-color: var(--cd-color-date-picker-date-in-hover-bg-default, var(--cd-color-fill-0));
  }
  :global(.cd-datepicker-day-hoverday-inrange .cd-datepicker-day-main),
  :global(.cd-datepicker-day-hoverday-beforerange .cd-datepicker-day-main),
  :global(.cd-datepicker-day-hoverday-afterrange .cd-datepicker-day-main),
  /* hoverday-around-singleselected：对齐 Semi `hoverday_around_single_selected-bg-default=primary-light-active`。 */
  :global(.cd-datepicker-day-hoverday-around-singleselected .cd-datepicker-day-main) {
    background-color: var(--cd-color-primary-light-active);
  }
  :global(.cd-datepicker-day-selectedrange-hover .cd-datepicker-day-main) {
    background-color: var(--cd-color-primary-light-hover);
  }

  /* selected 端点/整体：主色底 + 白字 */
  :global(.cd-datepicker-day-selected .cd-datepicker-day-main),
  :global(.cd-datepicker-day-selected-start .cd-datepicker-day-main),
  :global(.cd-datepicker-day-selected-end .cd-datepicker-day-main) {
    background-color: var(--cd-color-date-picker-date-selected-bg-default, var(--cd-color-primary));
    color: var(--cd-color-date-picker-date-selected-text-default, var(--cd-color-white, #fff));
  }
  :global(.cd-datepicker-day-selected .cd-datepicker-day-main:hover),
  :global(.cd-datepicker-day-selected-start .cd-datepicker-day-main:hover),
  :global(.cd-datepicker-day-selected-end .cd-datepicker-day-main:hover) {
    background-color: var(--cd-color-date-picker-date-selected-bg-default, var(--cd-color-primary));
  }
  /* selected 单点（既是 start 又是 end）四角圆角 */
  :global(.cd-datepicker-day-selected .cd-datepicker-day-main),
  :global(.cd-datepicker-day-selected-start.cd-datepicker-day-selected-end .cd-datepicker-day-main) {
    border-radius: var(--cd-radius-date-picker-day-main, 3px);
  }

  /* selected 端点朝 hover 延伸方向加 1px 主色边框（对齐 Semi
     `selected-start-afterhover/selected-end-beforehover { border: 1px solid day_main-border(=primary-active) }`）。 */
  :global(.cd-datepicker-day-selected-start-afterhover .cd-datepicker-day-main),
  :global(.cd-datepicker-day-selected-end-beforehover .cd-datepicker-day-main) {
    border: 1px solid var(--cd-color-primary-active);
  }

  /* disabled */
  :global(.cd-datepicker-day-disabled) {
    cursor: not-allowed;
    color: var(--cd-color-date-picker-date-disabled-text-default);
  }
  :global(.cd-datepicker-day-disabled .cd-datepicker-day-main) {
    color: var(--cd-color-date-picker-date-disabled-text-default);
    background-color: transparent;
    cursor: not-allowed;
  }
  /* disabled hover/active 不改背景（对齐 Semi day-disabled day-main :hover/:active transparent）。 */
  :global(.cd-datepicker-day-disabled .cd-datepicker-day-main:hover),
  :global(.cd-datepicker-day-disabled .cd-datepicker-day-main:active) {
    background-color: transparent;
  }
  /* disabled 且处于选中/范围态：用禁用底色覆盖选中色（对齐 Semi day-disabled&day-selected... 组合，
     background=disabled-bg-default(=disabled-fill)、color=disabled-text）。 */
  :global(.cd-datepicker-day-disabled.cd-datepicker-day-selected .cd-datepicker-day-main),
  :global(.cd-datepicker-day-disabled.cd-datepicker-day-selected-start .cd-datepicker-day-main),
  :global(.cd-datepicker-day-disabled.cd-datepicker-day-selected-end .cd-datepicker-day-main),
  :global(.cd-datepicker-day-disabled.cd-datepicker-day-inhover .cd-datepicker-day-main),
  :global(.cd-datepicker-day-disabled.cd-datepicker-day-inrange .cd-datepicker-day-main),
  :global(.cd-datepicker-day-disabled.cd-datepicker-day-inoffsetrange .cd-datepicker-day-main),
  :global(.cd-datepicker-day-disabled.cd-datepicker-day-hoverday .cd-datepicker-day-main),
  :global(.cd-datepicker-day-disabled.cd-datepicker-day-hoverday-offset .cd-datepicker-day-main),
  :global(.cd-datepicker-day-disabled.cd-datepicker-day-offsetrange-start .cd-datepicker-day-main),
  :global(.cd-datepicker-day-disabled.cd-datepicker-day-offsetrange-end .cd-datepicker-day-main),
  :global(.cd-datepicker-day-disabled.cd-datepicker-day-selectedrange-hover .cd-datepicker-day-main) {
    background-color: var(--cd-color-disabled-fill);
    color: var(--cd-color-date-picker-date-disabled-text-default);
  }

  /* —— RTL（逐条对齐 Semi datePicker/rtl.scss &-day）——
     selected-start/offsetrange-start 与 selected-end/offsetrange-end 镜像 margin +
     border-radius（本库 LTR 已把 Semi 分写的 offsetrange-单独 radius 规则与
     selected-start∪offsetrange-start 合并规则收作一条等价写法，RTL 同样合并镜像）。 */
  :global(.cd-rtl) :global(.cd-datepicker-day-selected-start .cd-datepicker-day-main),
  :global(.cd-rtl) :global(.cd-datepicker-day-offsetrange-start .cd-datepicker-day-main) {
    margin-right: 2px;
    margin-left: 0;
    border-radius: 0 var(--cd-radius-date-picker-day-main, 3px)
      var(--cd-radius-date-picker-day-main, 3px) 0;
  }
  :global(.cd-rtl) :global(.cd-datepicker-day-selected-end .cd-datepicker-day-main),
  :global(.cd-rtl) :global(.cd-datepicker-day-offsetrange-end .cd-datepicker-day-main) {
    margin-left: 2px;
    margin-right: 0;
    border-radius: var(--cd-radius-date-picker-day-main, 3px) 0 0
      var(--cd-radius-date-picker-day-main, 3px);
  }
  /* compact 下的镜像同样由上面通用 RTL 规则 + token 覆写自动跟随，无需重复。 */
</style>
