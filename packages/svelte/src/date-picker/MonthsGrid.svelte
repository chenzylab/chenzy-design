<!--
  MonthsGrid —— 对齐 Semi datePicker/monthsGrid.tsx（面板容器 + 状态机中枢消费方）。
  单面板(date/dateTime)：renderPanel(wrap > Navigation + Month) + yam 叠加层(年月滚轮) + Switch(dateTime)。
  range 双面板随后补入。状态机走 months-grid-foundation（handleDayClick/导航/面板切换）。
  Semi 结构：div.-month-grid-{panelType} > [yam 叠加] > wrap(Navigation+Month) > Switch。
-->
<script lang="ts">
  import { useLocale } from '../locale-provider/index.js';
  import { localeFormat } from '@chenzy-design/core';
  import Navigation from './Navigation.svelte';
  import Month from './Month.svelte';
  import Switch from './Switch.svelte';
  import YearAndMonth from './YearAndMonth.svelte';
  import Combobox from '../time-picker/Combobox.svelte';
  import { cssClasses, formatToken, strings, type Density } from './constants.js';
  import {
    createMonthsGridState,
    type MonthsGridFoundationProps,
    type PanelType,
  } from './months-grid-foundation.svelte.js';
  import type { MonthDayInfo, DayStatus } from './month-foundation.svelte.js';
  import getMonthTable from './_utils/getMonthTable.js';
  import type { WeekStartNumber } from './_utils/getDayOfWeek.js';
  import type { Snippet } from 'svelte';

  interface Props extends Partial<MonthsGridFoundationProps> {
    type: string;
    selected?: Set<string>;
    rangeStart?: string;
    rangeEnd?: string;
    density?: Density;
    disabledTimePicker?: boolean;
    startYear?: number;
    endYear?: number;
    renderDate?: Snippet<[number | string, string]>;
    renderFullDate?: Snippet<[number | string, string, DayStatus]>;
    /** 时间选择器透传选项（对齐 Semi timePickerOpts）：spread 给 tpk Combobox 的 scrollItemProps。 */
    timePickerOpts?: Record<string, unknown>;
    /** 隐藏禁用时间项（对齐 Semi hideDisabledOptions）：传给 tpk Combobox。 */
    hideDisabledOptions?: boolean;
  }

  let {
    type,
    selected: selectedProp,
    rangeStart: rangeStartProp,
    rangeEnd: rangeEndProp,
    density = 'default',
    disabledTimePicker = false,
    weekStartsOn = 0,
    disabledDate,
    disabledTime,
    defaultPickerValue,
    multiple = false,
    max,
    onMaxLimit,
    syncSwitchMonth = false,
    rangeInputFocus = false,
    setRangeInputFocus,
    startYear,
    endYear,
    onSelectedChange,
    onPanelChange,
    renderDate,
    renderFullDate,
    timePickerOpts,
    startDateOffset,
    endDateOffset,
    hideDisabledOptions = false,
  }: Props = $props();

  const loc = useLocale();
  const PREFIX = cssClasses.PREFIX;

  const st = createMonthsGridState(() => ({
    type,
    multiple,
    ...(max !== undefined ? { max } : {}),
    ...(onMaxLimit ? { onMaxLimit } : {}),
    syncSwitchMonth,
    rangeInputFocus,
    // range 双面板：left 面板对应 rangeStart、right 对应 rangeEnd；单面板恒视为「另一面板未开」。
    isAnotherPanelHasOpened: () => /range/i.test(type),
    ...(setRangeInputFocus ? { setRangeInputFocus } : {}),
    ...(defaultPickerValue !== undefined ? { defaultPickerValue } : {}),
    ...(disabledDate ? { disabledDate } : {}),
    ...(disabledTime ? { disabledTime } : {}),
    ...(onSelectedChange ? { onSelectedChange } : {}),
    ...(onPanelChange ? { onPanelChange } : {}),
    ...(startDateOffset ? { startDateOffset } : {}),
    ...(endDateOffset ? { endDateOffset } : {}),
  }));

  // 供父组件（DatePickerNext）在手动输入回车提交后命令面板跳到输入值的月份。
  // 具名导出（对齐本库惯例：Svelte 无静态方法，用组件 export function + bind:this）。
  export function syncPanelTo(base: Date): void {
    st.syncPanelToBase(base);
  }

  // 受控 selected/range：外部传入优先，否则用内部状态机（对齐 Semi state）。
  const selected = $derived(selectedProp ?? st.selected);
  const rangeStart = $derived(rangeStartProp ?? st.rangeStart);
  const rangeEnd = $derived(rangeEndProp ?? st.rangeEnd);

  const LEFT = strings.PANEL_TYPE_LEFT as PanelType;
  const RIGHT = strings.PANEL_TYPE_RIGHT as PanelType;
  const isRange = $derived(/range/i.test(type));

  // maxWeekNum —— 双面板两个月表周行数不齐时对齐到较多者（对齐 Semi maxWeekNum），避免高度不齐。
  const maxWeekNum = $derived.by(() => {
    if (!isRange) return undefined;
    const l = getMonthTable(st.monthLeft.pickerDate, weekStartsOn as WeekStartNumber).weeks.length;
    const r = getMonthTable(st.monthRight.pickerDate, weekStartsOn as WeekStartNumber).weeks.length;
    return Math.max(l, r);
  });

  // Navigation monthText（对齐 Semi：locale.months 模板；此处用 yyyy-MM 简化到 locale monthText）。
  function monthTextOf(panelType: PanelType): string {
    const d = (panelType === 'right' ? st.monthRight : st.monthLeft).pickerDate;
    // 对齐 Semi monthText：语言相关「YYYY年 MM月」；这里走 locale.months + 年。
    const y = localeFormat(d, 'yyyy');
    const monthNo = d.getMonth() + 1;
    const mText = loc().t(`DatePicker.months.${monthNo}`);
    // Semi 用 locale.monthText 模板 ${year}/${month}；本库简化为 "y年 mText" / "y mText"。
    const code = loc().code;
    return code === 'zh-CN' || code === 'zh-TW' ? `${y}年 ${mText}` : `${y} ${mText}`;
  }

  const disabledDateWrap = $derived(
    disabledDate ? (d: Date) => (disabledDate as (x: Date) => boolean)(d) : undefined,
  );
  const monthRest = $derived({
    ...(disabledDateWrap ? { disabledDate: disabledDateWrap } : {}),
    ...(renderDate ? { renderDate } : {}),
    ...(renderFullDate ? { renderFullDate } : {}),
  });

  const isTimeType = $derived(type.includes('Time'));

  function panelDetail(panelType: PanelType) {
    return panelType === 'right' ? st.monthRight : st.monthLeft;
  }
</script>

{#snippet panel(panelType: PanelType)}
  {@const detail = panelDetail(panelType)}
  <div
    class={`${PREFIX}-month-grid-${panelType}`}
    {...{ 'x-open-type': detail.isTimePickerOpen ? 'time' : detail.isYearPickerOpen ? 'year' : 'date' }}
  >
    {#if detail.isYearPickerOpen}
      <div class={`${PREFIX}-yam`}>
        <YearAndMonth
          {type}
          currentYear={{ left: detail.pickerDate.getFullYear(), right: detail.pickerDate.getFullYear() }}
          currentMonth={{ left: detail.pickerDate.getMonth() + 1, right: detail.pickerDate.getMonth() + 1 }}
          {density}
          localeCode={loc().code}
          {...(startYear !== undefined ? { startYear } : {})}
          {...(endYear !== undefined ? { endYear } : {})}
          {...(disabledDateWrap ? { disabledDate: disabledDateWrap } : {})}
          onSelect={({ currentYear, currentMonth }) =>
            st.toYearMonth(panelType, new Date(currentYear.left, currentMonth.left - 1))}
          onBackToMain={() => st.showDatePanel(panelType)}
        />
      </div>
    {/if}
    <!-- 时间列面板（tpk 叠加层，对齐 Semi renderTimePicker）：复用 Combobox（拆分 #18） -->
    {#if detail.isTimePickerOpen}
      {@const dt = st.calcDisabledTime(panelType)}
      <div class={`${PREFIX}-tpk`}>
        <Combobox
          prefixCls={`${PREFIX}-tpk-col`}
          timeStampValue={detail.pickerDate}
          format={formatToken.FORMAT_TIME_PICKER}
          panelHeader={loc().t('DatePicker.selectTime')}
          disabledHours={dt?.disabledHours}
          disabledMinutes={dt?.disabledMinutes ? (h) => dt.disabledMinutes!(h ?? 0) : undefined}
          disabledSeconds={dt?.disabledSeconds ? (h, m) => dt.disabledSeconds!(h ?? 0, m ?? 0) : undefined}
          {hideDisabledOptions}
          {...(timePickerOpts ? { scrollItemProps: timePickerOpts } : {})}
          onChange={(payload) => st.handleTimeChange({ timeStampValue: payload.timeStampValue }, panelType)}
        />
      </div>
    {/if}
    <!-- 日期视图（yam/tpk 开时非 range 不渲染主体，对齐 Semi） -->
    {#if !detail.isYearPickerOpen && !detail.isTimePickerOpen}
      <div>
        <Navigation
          monthText={monthTextOf(panelType)}
          {density}
          {panelType}
          shouldBimonthSwitch={isRange && syncSwitchMonth}
          onMonthClick={() => st.showYearPicker(panelType)}
          onPrevMonth={() => st.prevMonth(panelType)}
          onNextMonth={() => st.nextMonth(panelType)}
          onPrevYear={() => st.prevYear(panelType)}
          onNextYear={() => st.nextYear(panelType)}
        />
        <Month
          month={detail.pickerDate}
          {selected}
          {rangeStart}
          {rangeEnd}
          hoverDay={st.hoverDay}
          offsetRangeStart={st.offsetRangeStart}
          offsetRangeEnd={st.offsetRangeEnd}
          weekStartsOn={weekStartsOn as WeekStartNumber}
          {multiple}
          {...(maxWeekNum !== undefined ? { weeksRowNum: maxWeekNum } : {})}
          onDayClick={(day: MonthDayInfo) => st.handleDayClick(day, panelType)}
          onDayHover={(day?: MonthDayInfo) => st.handleDayHover(day ?? { fullDate: '' })}
          {...monthRest}
        />
      </div>
    {/if}
    <!-- dateTime 面板日期/时间切换 -->
    {#if isTimeType}
      <Switch
        showDate={detail.showDate}
        isTimePickerOpen={detail.isTimePickerOpen}
        {density}
        {disabledTimePicker}
        timeFormat={formatToken.FORMAT_TIME_PICKER}
        onShowDatePanel={() => st.showDatePanel(panelType)}
        onShowTimePicker={() => st.showTimePicker(panelType)}
      />
    {/if}
  </div>
{/snippet}

{#if isRange}
  <!-- range 双面板并排（对齐 Semi -month-grid-left/-right） -->
  <div class={`${PREFIX}-month-grid`}>
    {@render panel(LEFT)}
    {@render panel(RIGHT)}
  </div>
{:else}
  {@render panel(LEFT)}
{/if}

<style>
  /* 双月网格 + 单面板 —— 对齐 Semi datePicker.scss -month-grid/-month-grid-left/-right。
     class 动态字符串，用 :global 打洞（本库既定 scoped+:global）。 */
  :global(.cd-datepicker-month-grid) {
    user-select: none;
    display: flex;
  }
  :global(.cd-datepicker-month-grid-left),
  :global(.cd-datepicker-month-grid-right) {
    position: relative; /* yam/tpk 绝对定位上下文 */
    padding: 0;
    display: inline-flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  /* yam（年月滚轮）/ tpk（时间列）叠加覆盖层（对齐 Semi：absolute top:0 width:100%） */
  :global(.cd-datepicker-yam) {
    position: absolute;
    top: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
  /* time 视图时给父容器明确高度（对齐 Semi：月历面板仍占位撑高，tpk 绝对覆盖其上，
     其 height:calc(100% - 54px) 才有依据）。253(月历)+32(导航)+16(导航padding)+54(switch)≈355px 面板高。 */
  :global(.cd-datepicker-month-grid-left[x-open-type='time']),
  :global(.cd-datepicker-month-grid-right[x-open-type='time']) {
    min-height: 355px;
  }
  /* tpk 时间列面板：高度对齐 Semi `.semi-datepicker-tpk { height: calc(100% - 54px) }`（54=switch 条高）。 */
  :global(.cd-datepicker-tpk) {
    position: absolute;
    top: 0;
    height: calc(100% - 54px);
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  /* tpk 里 scrolllist 撑满（对齐 Semi datePicker.scss `.semi-datepicker-month-grid .semi-scrolllist{width:100%;height:100%;flex:1}`），
     列走 ScrollList 基础 flex:1 均分（不吃 timePicker 的 64px），故 h/m/s 三列平分日历宽不溢出。 */
  :global(.cd-datepicker-tpk .cd-scrolllist) {
    width: 100%;
    height: 100%;
    box-shadow: none;
    overflow: hidden;
    flex: 1;
  }
  :global(.cd-datepicker-tpk .cd-scrolllist-body) {
    width: 100%;
    height: 100%;
    overflow: hidden;
    flex: 1;
  }
  /* 列居中留白按 tpk body 高度重算（对齐 Semi：(body - item) * 0.5，body≈355-54-54≈247px）。 */
  :global(.cd-datepicker-tpk .cd-scrolllist-item > ul::before) {
    block-size: calc((247px - var(--cd-height-scroll-list-item)) * 0.5);
  }
  :global(.cd-datepicker-tpk .cd-scrolllist-item > ul) {
    padding-block-end: calc((247px - var(--cd-height-scroll-list-item)) * 0.5);
  }

  /* 导航条 —— 对齐 Semi -navigation */
  :global(.cd-datepicker-navigation) {
    display: flex;
    align-items: center;
    box-sizing: content-box;
    height: 32px;
    /* 对齐 Semi `padding: navigation-paddingY(base-tight 12px) navigation-paddingX(base 16px)`。 */
    padding: var(--cd-spacing-base-tight, 12px) var(--cd-spacing-base, 16px);
  }
  :global(.cd-datepicker-navigation-month) {
    font-size: var(--cd-font-size-header-6, 16px);
    flex-grow: 1;
    text-align: center;
    font-weight: var(--cd-font-weight-bold, 600);
    color: var(--cd-color-date-picker-nav-month-icon-text-default, var(--cd-color-text-0));
  }
  :global(.cd-datepicker-navigation .cd-button) {
    color: var(--cd-color-date-picker-nav-icon-text-default, var(--cd-color-text-2));
  }
  :global(.cd-datepicker-navigation-month .cd-button) {
    color: var(--cd-color-date-picker-nav-month-icon-text-default, var(--cd-color-text-0));
  }

  /* 日期/时间切换条 —— 对齐 Semi -switch */
  :global(.cd-datepicker-switch) {
    text-align: center;
    display: flex;
    border-top: var(--cd-width-date-picker-border, 1px) solid
      var(--cd-color-date-picker-border-bg-default);
    margin-top: auto;
  }
  :global(.cd-datepicker-switch-date),
  :global(.cd-datepicker-switch-time) {
    width: 50%;
    cursor: pointer;
    padding-top: 6px;
    padding-bottom: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--cd-color-date-picker-day-text-default, var(--cd-color-text-2));
  }
  :global(.cd-datepicker-switch-date:not(.cd-datepicker-switch-time-disabled):hover),
  :global(.cd-datepicker-switch-time:not(.cd-datepicker-switch-time-disabled):hover) {
    background-color: var(--cd-color-date-picker-date-bg-hover);
  }
  :global(.cd-datepicker-switch-date-active) {
    color: var(--cd-color-date-picker-day-text-active, var(--cd-color-text-0));
    font-weight: var(--cd-font-weight-bold, 600);
    cursor: auto;
  }
  :global(.cd-datepicker-switch-time-disabled) {
    cursor: not-allowed;
  }
  :global(.cd-datepicker-switch-text) {
    padding-left: 4px;
  }
</style>
