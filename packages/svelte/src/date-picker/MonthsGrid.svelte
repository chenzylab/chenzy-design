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
    /** 各端「本次开合内是否被聚焦过」（对齐 Semi focusRecordsRef）——Month 的越界禁用判定要它。 */
    focusRecords?: { rangeStart: boolean; rangeEnd: boolean };
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
    focusRecords,
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
    /**
     * 照搬 Semi datePicker.tsx:610：问的是「**另一端**是否已被聚焦过」。
     *   rangeStart → 返回 focusRecords.rangeEnd；rangeEnd → 返回 focusRecords.rangeStart
     * handleRangeSelected 用它决定选完一端后是否把焦点甩到对面：另一端已聚焦过就不再甩，
     * 避免把已选值冲掉。
     *
     * 此前写死 `() => /range/i.test(type)`（range 恒 true 且不看问哪一端），
     * 导致重开后点日期时焦点流转判错。
     */
    isAnotherPanelHasOpened: (currentRangeInput: 'rangeStart' | 'rangeEnd') =>
      currentRangeInput === 'rangeStart'
        ? !!focusRecords?.rangeEnd
        : !!focusRecords?.rangeStart,
    ...(setRangeInputFocus ? { setRangeInputFocus } : {}),
    ...(defaultPickerValue !== undefined ? { defaultPickerValue } : {}),
    ...(disabledDate ? { disabledDate } : {}),
    ...(disabledTime ? { disabledTime } : {}),
    ...(onSelectedChange ? { onSelectedChange } : {}),
    ...(onPanelChange ? { onPanelChange } : {}),
    ...(startDateOffset ? { startDateOffset } : {}),
    ...(endDateOffset ? { endDateOffset } : {}),
  }));

  // 供父组件（DatePicker）在手动输入回车提交后命令面板跳到输入值的月份。
  // 具名导出（对齐本库惯例：Svelte 无静态方法，用组件 export function + bind:this）。
  export function syncPanelTo(base: Date): void {
    st.syncPanelToBase(base);
  }

  /**
   * 供 DatePicker 在打开面板时用 range 两端的真实 Date 初始化两个面板
   * （照搬 Semi `_initDateRangePickerFromValue`）。dateTimeRange 下 pickerDate
   * 同时是该端的**时间源**，不同步则右面板会拿左端的时间。
   */
  export function syncPanelsFromRange(values: Array<Date | null>): void {
    st.syncPanelsFromRangeValue(values);
  }

  // 受控 selected/range：外部传入优先，否则用内部状态机（对齐 Semi state）。
  // range 用 `||` 而非 `??`：外部 rangeStart/End 来自「已提交的值」（currentRange），
  // 而 range 只有两端都选完才提交，选中起点后外部仍是空串 ''——用 `??` 会让空串盖掉
  // foundation 里已写入的起点。
  const selected = $derived(selectedProp ?? st.selected);
  const rangeStart = $derived(rangeStartProp || st.rangeStart);
  const rangeEnd = $derived(rangeEndProp || st.rangeEnd);

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

  // 语言相关日期格式（对齐 Semi locale.localeFormatToken.FORMAT_SWITCH_DATE）：英文 MM/dd/yyyy、中文 yyyy-MM-dd。
  const switchDateFormat = $derived(
    loc().component('DatePicker').localeFormatToken?.FORMAT_SWITCH_DATE ??
      formatToken.FORMAT_FULL_DATE,
  );

  // Navigation monthText —— 照搬 Semi monthsGrid.renderMonth：取 locale.monthText 模板
  // （中文 '${year}年 ${month}'、英文 '${month} ${year}'）做 replace，由语言自身决定年月顺序。
  // 勿改回按 locale.code 分支硬编码——那样每加一种语言都要改组件，且英文会得到错误的「2026 Jul」。
  function monthTextOf(panelType: PanelType): string {
    const d = (panelType === 'right' ? st.monthRight : st.monthLeft).pickerDate;
    const yearNumber = localeFormat(d, 'yyyy');
    const mText = loc().t(`DatePicker.months.${d.getMonth() + 1}`);
    return loc()
      .t('DatePicker.monthText')
      .replace('${year}', yearNumber)
      .replace('${month}', mText);
  }

  /**
   * dateTimeRange 两侧 Switch 的日期文案（照搬 Semi renderSwitch：左panel 取 rangeStart、
   * 右panel 取 rangeEnd，按语言相关 FORMAT_SWITCH_DATE 重新格式化）。非 range 时为空串，
   * 由 Switch 回落 showDate 的 monthText。
   */
  function switchDateTextOf(panelType: PanelType): string {
    const raw = panelType === 'right' ? rangeEndProp : rangeStartProp;
    if (!raw) return '';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '';
    return localeFormat(d, switchDateFormat);
  }

  /**
   * YearAndMonth 只按「年/月」判禁用，签名是 `(date) => boolean`，没有 range 上下文，
   * 故单参包装。**Month 不能用它**——Semi 的 disabledDate 第二参 options 携带
   * `{ rangeStart, rangeEnd, rangeInputFocus }`，动态禁用 demo
   * （禁止选择早于已选起点的日期）全靠它。
   */
  const disabledDateWrap = $derived(
    disabledDate ? (d: Date) => (disabledDate as (x: Date) => boolean)(d) : undefined,
  );
  const monthRest = $derived({
    // 原样透传（不再经单参包装）：包装会吞掉 Month 传入的 disabledOptions，
    // 用户回调里 options.rangeStart 恒 undefined → 动态禁用整个失效。
    ...(disabledDate ? { disabledDate } : {}),
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
    class={`${PREFIX}-month-grid-${panelType}${
      // tpk/yam 打开时加 -yam-showing：日历被卸载后容器会塌（单面板塌到内容宽 180、
      // range 两侧都切 time 时更会塌到高 53），靠这个类的 min-width/height 撑住。
      // 对齐 Semi monthsGrid.tsx 的 style.minWidth/minHeight —— Semi 用缓存的日历实测尺寸，
      // 本库用等价常量（单侧日历宽 = day 36×7 + month padding 16×2 = 284，与 yamShowing_min 同值）。
      detail.isTimePickerOpen || detail.isYearPickerOpen ? ` ${PREFIX}-yam-showing` : ''
    }`}
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
        <!-- timePickerOpts 整体 spread（对齐 Semi monthsGrid.tsx `{...restProps}`）：demo 传
             `timePickerOpts={{ scrollItemProps: {...} }}`，其中 scrollItemProps 正好落到 Combobox
             同名 prop；原实现又包了一层 scrollItemProps，导致 wheel/cycled 丢失。 -->
        <Combobox
          prefixCls={`${PREFIX}-tpk-col`}
          timeStampValue={detail.pickerDate}
          format={formatToken.FORMAT_TIME_PICKER}
          panelHeader={loc().t('DatePicker.selectTime')}
          disabledHours={dt?.disabledHours}
          disabledMinutes={dt?.disabledMinutes ? (h) => dt.disabledMinutes!(h ?? 0) : undefined}
          disabledSeconds={dt?.disabledSeconds ? (h, m) => dt.disabledSeconds!(h ?? 0, m ?? 0) : undefined}
          {hideDisabledOptions}
          {...(timePickerOpts ?? {})}
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
        <!-- rangeInputFocus 必须下传：hover 预览区间（Semi isHover→_isHoverAfterStart/
             _isHoverBeforeEnd）依赖聚焦端，漏传则 Month 取默认 false，
             选中起点后 hover 中间日期整段不高亮。
             focusRecords 同理必须下传：Month 的越界禁用（聚焦 rangeEnd 后禁用早于
             rangeStart 的日期、反之亦然）靠它判定，漏传则 month-foundation 里
             两个条件恒 false、整个禁用静默失效。 -->
        <Month
          month={detail.pickerDate}
          {selected}
          {rangeStart}
          {rangeEnd}
          {rangeInputFocus}
          {...(focusRecords ? { focusRecords } : {})}
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
        dateText={switchDateTextOf(panelType)}
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
  /* 注：time 视图的父容器高度已由 DatePicker 的 `-yam-showing`（Semi
     $height-datepicker_yamShowing_min = 378）承担，此处不再自造近似值（原写 355，
     与 Semi 差 23，且同特异性下会压过 -yam-showing）。 */
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
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow: hidden;
    flex: 1;
    /* datePicker 场景把 ScrollList 默认的 `0 16px` 归零（对齐 Semi datePicker.scss
       `-body { padding: $spacing-datepicker_scrolllist_body-padding }` = 0）。
       不归零会让 tpk 三列被挤窄（实测 216→179）。 */
    padding: var(--cd-spacing-date-picker-scrolllist-body-padding, 0);
  }
  :global(.cd-datepicker-tpk .cd-scrolllist-header) {
    box-sizing: border-box;
    width: 100%;
    border-bottom: var(--cd-width-date-picker-border, 1px) solid
      var(--cd-color-date-picker-border-bg-default);
    padding: var(--cd-spacing-date-picker-scrolllist-header-padding, 16px);
  }
  /* header 内部（照搬 Semi datePicker.scss 同一段 `-line` / `-header-title`）：
     · line 隐藏——ScrollList 自带的分隔线在 datePicker 场景不显示（会压在标题下方成一条空白横线）；
     · title padding 归零 + min-height/line-height 24——ScrollList 默认 title 带 `16px 0`，
       两层 padding 叠加会让 header 从 Semi 的 57 撑到 86，挤掉列表可视高度。 */
  :global(.cd-datepicker-tpk .cd-scrolllist-line) {
    display: none;
  }
  :global(.cd-datepicker-tpk .cd-scrolllist-header-title) {
    padding: 0;
    min-height: var(--cd-height-date-picker-timepicker-header-min, 24px);
    line-height: var(--cd-height-date-picker-timepicker-header-min, 24px);
  }
  /* 列居中留白 = (body - item) * 0.5（对齐 Semi）。body 由面板高推出：
     yamShowing_min(378) - switch(54) - scrolllist header(57) = 267（与 Semi 实测一致）。 */
  :global(.cd-datepicker-tpk .cd-scrolllist-item > ul::before),
  :global(.cd-datepicker-tpk .cd-scrolllist-item > ul) {
    /* 57 = scrolllist header 实高（padding 16×2 + title 24 + 分割线 1，与 Semi 实测一致）；
       54 = switch 条高（Semi $height-datepicker_switch）。 */
    --cd-tpk-body-h: calc(var(--cd-height-date-picker-yam-showing-min, 378px) - 54px - 57px);
  }
  :global(.cd-datepicker-tpk .cd-scrolllist-item > ul::before) {
    block-size: calc((var(--cd-tpk-body-h) - var(--cd-height-scroll-list-item)) * 0.5);
  }
  :global(.cd-datepicker-tpk .cd-scrolllist-item > ul) {
    padding-block-end: calc((var(--cd-tpk-body-h) - var(--cd-height-scroll-list-item)) * 0.5);
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
  /* 导航按钮改中性色（对齐 Semi datePicker.scss `-navigation .semi-button { color: text-2 }`
     与 `-navigation-month .semi-button { color: text-0 }`）：本库 Button 的
     `.cd-button-primary.cd-button-borderless.svelte-xxx` 带 scope 类、特异性 (0,3,0)，
     会让默认主色蓝盖过来；用 Semi 原样的 `:not(#neverExistElement)` 抬权重压过它。 */
  :global(.cd-datepicker-navigation .cd-button:not(#neverExistElement)) {
    color: var(--cd-color-date-picker-nav-icon-text-default, var(--cd-color-text-2));
  }
  :global(.cd-datepicker-navigation-month .cd-button:not(#neverExistElement)) {
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
