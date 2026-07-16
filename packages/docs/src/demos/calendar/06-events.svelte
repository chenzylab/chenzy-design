<script lang="ts">
  import { Calendar, DatePicker, RadioGroup, Radio } from '@chenzy-design/svelte';
  import type { CalendarEvent } from '@chenzy-design/svelte';

  type Mode = 'day' | 'week' | 'month' | 'range';
  let mode = $state<Mode>('week');
  let displayValue = $state(new Date(2019, 6, 23, 8, 32, 0));
</script>

<!-- 对齐 Semi「事件渲染用法」：每个事件的 children 直接是带样式的块（daily 边框块 / allday 底块）。 -->
{#snippet daily(label: string)}
  <div class="evt evt--daily">{label}</div>
{/snippet}
{#snippet allday(label: string)}
  <div class="evt evt--allday">{label}</div>
{/snippet}

{#snippet e0()}{@render daily('6月25日 14:45 ~ 7月26日 6:18')}{/snippet}
{#snippet e1()}{@render allday('7月18日 10:00 ~ 7月30日 8:00')}{/snippet}
{#snippet e2()}{@render allday('7月19日 20:00 ~ 7月23日 14:00')}{/snippet}
{#snippet e3()}{@render allday('7月21日 6:00 ~ 7月25日 6:00')}{/snippet}
{#snippet e4()}{@render allday('7月22日 全天')}{/snippet}
{#snippet e5()}{@render allday('7月22日 9:00 ~ 7月23日 23:00')}{/snippet}
{#snippet e6()}{@render daily('7月23日 8:32')}{/snippet}
{#snippet e7()}{@render daily('7月23日 14:30-20:00')}{/snippet}
{#snippet e8()}{@render allday('7月25日 8:00 ~ 7月27日 6:00')}{/snippet}
{#snippet e9()}{@render allday('7月26日 10:00 ~ 7月27日 16:00')}{/snippet}

<RadioGroup type="button" value={mode} onChange={(e) => (mode = e.target.value as Mode)}>
  <Radio value="day">日视图</Radio>
  <Radio value="week">周视图</Radio>
  <Radio value="month">月视图</Radio>
  <Radio value="range">多日视图</Radio>
</RadioGroup>

<div style="margin: 12px 0;">
  <DatePicker
    value={displayValue}
    onChange={(v) => {
      if (v instanceof Date) displayValue = v;
    }}
  />
</div>

<Calendar
  height={400}
  {mode}
  {displayValue}
  events={[
    { key: '0', start: new Date(2019, 5, 25, 14, 45), end: new Date(2019, 6, 26, 6, 18), children: e0 },
    { key: '1', start: new Date(2019, 6, 18, 10, 0), end: new Date(2019, 6, 30, 8, 0), children: e1 },
    { key: '2', start: new Date(2019, 6, 19, 20, 0), end: new Date(2019, 6, 23, 14, 0), children: e2 },
    { key: '3', start: new Date(2019, 6, 21, 6, 0), end: new Date(2019, 6, 25, 6, 0), children: e3 },
    { key: '4', allDay: true, start: new Date(2019, 6, 22, 8, 0), children: e4 },
    { key: '5', start: new Date(2019, 6, 22, 9, 0), end: new Date(2019, 6, 23, 23, 0), children: e5 },
    { key: '6', start: new Date(2019, 6, 23, 8, 32), end: new Date(2019, 6, 23, 8, 42), children: e6 },
    { key: '7', start: new Date(2019, 6, 23, 14, 30), end: new Date(2019, 6, 23, 20, 0), children: e7 },
    { key: '8', start: new Date(2019, 6, 25, 8, 0), end: new Date(2019, 6, 27, 6, 0), children: e8 },
    { key: '9', start: new Date(2019, 6, 26, 10, 0), end: new Date(2019, 6, 27, 16, 0), children: e9 },
  ] satisfies CalendarEvent[]}
  minEventHeight={40}
  range={mode === 'range' ? [new Date(2019, 6, 23), new Date(2019, 6, 26)] : undefined}
/>

<style>
  .evt {
    box-sizing: border-box;
    block-size: 100%;
    overflow: hidden;
    border-radius: 3px;
  }
  .evt--daily {
    padding: 10px;
    border: 1px solid var(--cd-color-primary);
    background-color: var(--cd-color-primary-light-default);
  }
  .evt--allday {
    padding: 2px 4px;
    border: 1px solid var(--cd-color-bg-1);
    background-color: var(--cd-color-primary-light-active);
  }
</style>
