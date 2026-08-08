<!--
  YearAndMonth —— 对齐 Semi datePicker/yearAndMonth.tsx。
  月/年滚轮覆盖层：header(-yearmonth-header：IconButton 返回 + selectDate 文案，noBackBtn 时无)
  + renderPanel(ScrollList > ScrollItem(year) + ScrollItem(month))。
  month 类型单面板；monthRange 双面板（body 内左右两个 panel）。复用 ScrollList/ScrollItem/IconButton。
  逻辑走 year-month-foundation（含 monthRange left/right + autoSelectMonth，无缩水）。
-->
<script lang="ts">
  import { useLocale } from '../locale-provider/index.js';
  import IconButton from '../iconbutton/IconButton.svelte';
  import ScrollList from '../scroll-list/ScrollList.svelte';
  import ScrollItem from '../scroll-list/ScrollItem.svelte';
  import { IconChevronLeft } from '@chenzy-design/icons';
  import { cssClasses, strings, type Density } from './constants.js';
  import {
    createYearMonthState,
    type PanelType,
    type LR,
    type YearItem,
    type MonthItem,
  } from './year-month-foundation.svelte.js';
  import type { ScrollItemSelectPayload } from '@chenzy-design/core';

  interface Props {
    type?: string;
    currentYear: LR;
    currentMonth: LR;
    startYear?: number;
    endYear?: number;
    density?: Density;
    noBackBtn?: boolean;
    monthCycled?: boolean;
    yearCycled?: boolean;
    localeCode?: string;
    disabledDate?: (date: Date) => boolean;
    onSelect?: (obj: { currentYear: LR; currentMonth: LR }) => void;
    onBackToMain?: () => void;
    /** 年月滚动列透传选项（对齐 Semi yearAndMonthOpts）：spread 给 year/month ScrollItem。 */
    scrollItemProps?: Record<string, unknown>;
  }

  let {
    type = 'date',
    currentYear,
    currentMonth,
    startYear,
    endYear,
    density = 'default',
    noBackBtn = false,
    monthCycled = false,
    yearCycled = false,
    localeCode,
    disabledDate,
    onSelect,
    onBackToMain,
    scrollItemProps,
  }: Props = $props();

  const loc = useLocale();
  const prefixCls = cssClasses.PREFIX;

  const st = createYearMonthState(() => ({
    type,
    currentYear,
    currentMonth,
    ...(startYear !== undefined ? { startYear } : {}),
    ...(endYear !== undefined ? { endYear } : {}),
    ...(disabledDate ? { disabledDate } : {}),
    ...(onSelect ? { onSelect } : {}),
    ...(onBackToMain ? { onBackToMain } : {}),
  }));

  const buttonSize = $derived<'small' | 'default'>(density === 'compact' ? 'small' : 'default');
  const iconBtnSize = $derived<'default' | 'large'>(density === 'compact' ? 'default' : 'large');
  const code = $derived(localeCode ?? loc().code);

  // 年/月文案变换：仅中文在**选中项**后加“年”/“月”（对齐 Semi yearAndMonth.tsx:158/205，
  // 两列各有一个 transform，只作用于选中项的展示文案）。
  const isZh = $derived(code === 'zh-CN' || code === 'zh-TW');
  const yearTransform = $derived<(v: unknown) => string>(
    isZh ? (v) => `${v}年` : (v) => String(v),
  );
  const monthTransform = $derived<(v: unknown) => string>(
    isZh ? (v) => `${v}月` : (v) => String(v),
  );

  const LEFT = strings.PANEL_TYPE_LEFT as PanelType;
  const RIGHT = strings.PANEL_TYPE_RIGHT as PanelType;

  // year 列表数据（value=年数字用于展示+匹配，携带 year/disabled）。
  function yearListData(panelType: PanelType) {
    return st.yearList(panelType).map((it: YearItem) => ({
      value: it.year,
      year: it.year,
      disabled: !!it.disabled,
    }));
  }
  // month 列表数据（value=fullMonths 文本，携带 month/disabled）。
  function monthListData(panelType: PanelType) {
    return st.monthList(panelType).map((it: MonthItem) => ({
      value: loc().t(`DatePicker.fullMonths.${it.month}`),
      month: it.month,
      disabled: !!it.disabled,
    }));
  }

  function onYearSelect(payload: ScrollItemSelectPayload, panelType: PanelType) {
    const year = payload.year as number;
    st.selectYear({ value: year, year }, panelType);
  }
  function onMonthSelect(payload: ScrollItemSelectPayload, panelType: PanelType) {
    const month = payload.month as number;
    st.selectMonth({ value: loc().t(`DatePicker.fullMonths.${month}`) as unknown as number, month }, panelType);
  }
</script>

{#snippet panel(panelType: PanelType)}
  <div class={`${prefixCls}-yearmonth-panel`}>
    <ScrollList>
      <ScrollItem
        mode="normal"
        cycled={yearCycled}
        list={yearListData(panelType)}
        transform={yearTransform}
        selectedIndex={st.years.findIndex((it) => it.value === st.currentYear[panelType])}
        type="year"
        aria-label={loc().t('DatePicker.yearColumnLabel')}
        {...(scrollItemProps ?? {})}
        onSelect={(payload) => onYearSelect(payload, panelType)}
      />
      <ScrollItem
        mode="normal"
        cycled={monthCycled}
        list={monthListData(panelType)}
        transform={monthTransform}
        selectedIndex={st.months.findIndex((it) => it.value === st.currentMonth[panelType])}
        type="month"
        aria-label={loc().t('DatePicker.monthColumnLabel')}
        {...(scrollItemProps ?? {})}
        onSelect={(payload) => onMonthSelect(payload, panelType)}
      />
    </ScrollList>
  </div>
{/snippet}

{#if !noBackBtn}
  <div class={`${prefixCls}-yearmonth-header`}>
    <IconButton size={buttonSize} iconSize={iconBtnSize} onclick={() => st.backToMain()}>
      {#snippet icon()}<IconChevronLeft aria-hidden="true" />{/snippet}
      <span>{loc().t('DatePicker.selectDate')}</span>
    </IconButton>
  </div>
{/if}

{#if type === 'monthRange'}
  <div class={`${prefixCls}-yearmonth-body`}>
    {@render panel(LEFT)}
    {@render panel(RIGHT)}
  </div>
{:else}
  {@render panel(LEFT)}
{/if}

<style>
  /* 年月面板顶栏 —— 照搬 Semi datePicker.scss `-yearmonth-header`（115-122）：
     paddingY/X + 底边框 + 上圆角 + flex 居中。 */
  :global(.cd-datepicker-yearmonth-header) {
    display: flex;
    align-items: center;
    padding: var(--cd-spacing-date-picker-yam-header-padding-y, 12px)
      var(--cd-spacing-date-picker-yam-header-padding-x, 16px);
    border-bottom: var(--cd-width-date-picker-border, 1px) solid
      var(--cd-color-date-picker-border-bg-default);
    border-radius: var(--cd-width-date-picker-yam-header-border-radius, 6px)
      var(--cd-width-date-picker-yam-header-border-radius, 6px) 0 0;
  }

  /* yam 面板的 ScrollList —— 照搬 Semi datePicker.scss（124-132）：
     背景 bg-3 + 无阴影 + 固定高 266 + 列项最小宽 64（wheel 模式额外加 outer paddingRight
     抹平差异）+ body padding 0。
     **background 不可省**：yam/tpk 是覆盖在日历之上的绝对定位层，缺底色会透出下层日历，
     insetInput 覆盖型浮层下更会透出触发器文字。 */
  :global(.cd-datepicker-panel-yam .cd-scrolllist),
  :global(.cd-datepicker-yearmonth-panel .cd-scrolllist) {
    background: var(--cd-color-date-picker-list-bg-default);
    box-shadow: none;
    height: var(--cd-height-date-picker-panel-yam-scrolllist, 266px);
  }
  /* 列项最小宽 —— Semi 有**两条**（datePicker.scss:196-207），wheel / normal 两种模式各一条：
     · wheel  模式 DOM 是 `-list-outer > ul > li`，取 64；
     · normal 模式 DOM 是 `-item > ul > li`，取 64 + wheel 的 outer paddingRight(18) = 82，
       Semi 原注释「add paddingRight to make the same width under wheel and normal mode」。
     本库 yam 列走 mode="normal"（YearAndMonth 里写死），**只搬 wheel 那条会完全落空**
     （normal 模式下根本没有 -list-outer 元素）→ 列宽塌到文字宽，
     monthRange 下「2026年」被挤成两行。 */
  :global(.cd-datepicker-panel-yam .cd-scrolllist-list-outer > ul > li),
  :global(.cd-datepicker-yearmonth-panel .cd-scrolllist-list-outer > ul > li) {
    min-width: var(--cd-width-date-picker-panel-yam-scrolllist-li-min, 64px);
  }
  :global(.cd-datepicker-panel-yam .cd-scrolllist-item > ul > li),
  :global(.cd-datepicker-yearmonth-panel .cd-scrolllist-item > ul > li) {
    min-width: calc(
      var(--cd-width-date-picker-panel-yam-scrolllist-li-min, 64px) +
        var(--cd-spacing-scroll-list-item-wheel-list-outer-paddingright, 18px)
    );
  }
  :global(.cd-datepicker-panel-yam .cd-scrolllist-body),
  :global(.cd-datepicker-yearmonth-panel .cd-scrolllist-body) {
    padding: 0;
    overflow: hidden;
  }

  /* monthRange 双面板横排（照搬 Semi datePicker.scss
     `.semi-datepicker-panel-yam .semi-datepicker-yearmonth-body { display: flex }`
     + 第 2 个 scrolllist 左分隔线）。缺此样式两个面板会块级堆叠成上下排列。 */
  :global(.cd-datepicker-yearmonth-body) {
    display: flex;
  }
  :global(.cd-datepicker-yearmonth-body > .cd-datepicker-yearmonth-panel:nth-child(2)) {
    border-left: 1px solid var(--cd-color-border);
  }

  /* —— RTL（对齐 Semi datePicker/rtl.scss &-yam：返回按钮箭头水平翻转）—— */
  :global(.cd-rtl) :global(.cd-datepicker-yearmonth-header .cd-icon-chevron_left) {
    transform: scaleX(-1);
  }
</style>
