<!--
  months-grid-foundation 验证夹具：消费 createMonthsGridState，把 state 渲染进 DOM，
  暴露方法供测试调用，断言单选/导航/面板切换的响应式更新。
-->
<script lang="ts">
  import {
    createMonthsGridState,
    type MonthsGridFoundationProps,
  } from './months-grid-foundation.svelte.js';
  import type { MonthDayInfo } from './month-foundation.svelte.js';

  let {
    type = 'date',
    multiple = false,
    max = undefined,
    defaultPickerValue = undefined,
    onSelectedChange = undefined,
  }: Partial<MonthsGridFoundationProps> = $props();

  // range 焦点端本地联动（模拟外部双 Input：setRangeInputFocus 切换）。
  let focus = $state<'rangeStart' | 'rangeEnd' | false>(false);

  const st = createMonthsGridState(() => ({
    get type() { return type; },
    get multiple() { return multiple; },
    get max() { return max; },
    get defaultPickerValue() { return defaultPickerValue; },
    get rangeInputFocus() { return focus; },
    setRangeInputFocus: (f) => { focus = f; },
    isAnotherPanelHasOpened: () => false,
    get onSelectedChange() { return onSelectedChange; },
  }));

  export function clickDay(fullDate: string) {
    st.handleDayClick({ dayNumber: Number(fullDate.split('-')[2]), fullDate } as MonthDayInfo, 'left');
  }
  export function timeChange(ts: number, panel: 'left' | 'right' = 'left') {
    st.handleTimeChange({ timeStampValue: ts }, panel);
  }
  export function hoverDay(fullDate: string) {
    st.handleDayHover({ fullDate });
  }
  export const api = st;
</script>

<div data-testid="selected">{[...st.selected].join(',')}</div>
<div data-testid="range-start">{st.rangeStart}</div>
<div data-testid="range-end">{st.rangeEnd}</div>
<div data-testid="focus">{String(st.rangeInputFocus)}</div>
<div data-testid="hover">{st.hoverDay}</div>
<div data-testid="left-picker">{st.monthLeft.pickerDate.getFullYear()}-{st.monthLeft.pickerDate.getMonth() + 1}</div>
<div data-testid="left-yam">{String(st.monthLeft.isYearPickerOpen)}</div>
<div data-testid="left-time">{String(st.monthLeft.isTimePickerOpen)}</div>
