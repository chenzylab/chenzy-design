<!--
  仅供 Calendar.kbd.test.ts（browser project）使用的网格键盘 e2e 夹具。
  内联月视图 Calendar（非 popup）：网格用真实 roving 焦点（活动格 tabindex=0，
  方向键命令式移动 DOM 焦点；跨月翻页落焦）。
  固定 defaultValue=2024-03-15 让初始网格稳定（active 格回退到选中/锚点）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Calendar from './Calendar.svelte';

  const defaultValue = new Date(2024, 2, 15);
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <Calendar
    mode="month"
    {defaultValue}
    defaultSelectedDate={defaultValue}
    locale="en-US"
    ariaLabel="calendar grid"
  />
</LocaleProvider>
