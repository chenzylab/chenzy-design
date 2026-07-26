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

  // 年文案变换：仅中文在选中年后加“年”（对齐 Semi transform）。
  const yearTransform = $derived<(v: unknown) => string>(
    code === 'zh-CN' || code === 'zh-TW' ? (v) => `${v}年` : (v) => String(v),
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
        ariaLabel={loc().t('DatePicker.yearColumnLabel')}
        {...(scrollItemProps ?? {})}
        onSelect={(payload) => onYearSelect(payload, panelType)}
      />
      <ScrollItem
        mode="normal"
        cycled={monthCycled}
        list={monthListData(panelType)}
        selectedIndex={st.months.findIndex((it) => it.value === st.currentMonth[panelType])}
        type="month"
        ariaLabel={loc().t('DatePicker.monthColumnLabel')}
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
