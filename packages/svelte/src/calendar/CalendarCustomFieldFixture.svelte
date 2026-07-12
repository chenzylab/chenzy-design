<!--
  回归夹具：event.children 承载自定义内容渲染。
  core 定位结果只保留 key/children，组件须按 key 查回原始事件取 children，
  自定义内容才能穿透。验证跨天全天事件（走 span 布局，最易丢字段）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Calendar from './Calendar.svelte';
  import type { CalendarEvent } from '@chenzy-design/core';
</script>

{#snippet spanChildren()}
  <span>CUSTOM_SPAN_LABEL</span>
{/snippet}

<LocaleProvider locale="zh_CN">
  <Calendar
    mode="week"
    displayValue={new Date(2019, 6, 23)}
    events={[
      {
        key: 'span-1',
        start: new Date(2019, 6, 21),
        end: new Date(2019, 6, 25),
        allDay: true,
        children: spanChildren,
      },
    ] satisfies CalendarEvent[]}
  />
</LocaleProvider>
