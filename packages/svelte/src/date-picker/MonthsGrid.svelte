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
    syncSwitchMonth = false,
    rangeInputFocus = false,
    setRangeInputFocus,
    startYear,
    endYear,
    onSelectedChange,
    renderDate,
    renderFullDate,
  }: Props = $props();

  const loc = useLocale();
  const PREFIX = cssClasses.PREFIX;

  const st = createMonthsGridState(() => ({
    type,
    multiple,
    syncSwitchMonth,
    rangeInputFocus,
    // range 双面板：left 面板对应 rangeStart、right 对应 rangeEnd；单面板恒视为「另一面板未开」。
    isAnotherPanelHasOpened: () => /range/i.test(type),
    ...(setRangeInputFocus ? { setRangeInputFocus } : {}),
    ...(defaultPickerValue !== undefined ? { defaultPickerValue } : {}),
    ...(disabledDate ? { disabledDate } : {}),
    ...(disabledTime ? { disabledTime } : {}),
    ...(onSelectedChange ? { onSelectedChange } : {}),
  }));

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
  <div class={`${PREFIX}-month-grid-${panelType}`}>
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
          timeStampValue={detail.pickerDate}
          format={formatToken.FORMAT_TIME_PICKER}
          panelHeader={loc().t('DatePicker.selectTime')}
          disabledHours={dt?.disabledHours}
          disabledMinutes={dt?.disabledMinutes ? (h) => dt.disabledMinutes!(h ?? 0) : undefined}
          disabledSeconds={dt?.disabledSeconds ? (h, m) => dt.disabledSeconds!(h ?? 0, m ?? 0) : undefined}
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
