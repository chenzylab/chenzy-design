<script lang="ts">
  // 日期三列联动（组合场景）：年 / 月 / 日三 wheel 列，改年或月时日列的天数联动重算，
  // 并把越界的选中日夹回本月最大天。月/日 cycled 循环滚动。
  import { ScrollList, ScrollItem, Text } from '@chenzy-design/svelte';
  import type { ScrollItemSelectPayload } from '@chenzy-design/svelte';

  let year = $state(2024);
  let month = $state(1); // 0-based
  let day = $state(15);

  const years = Array.from({ length: 20 }, (_, i) => ({ value: 2015 + i }));
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i, text: `${i + 1} 月` }));
  const daysInMonth = $derived(new Date(year, month + 1, 0).getDate());
  const days = $derived(
    Array.from({ length: daysInMonth }, (_, i) => ({ value: i + 1 })),
  );

  const yearIndex = $derived(Math.max(0, years.findIndex((y) => y.value === year)));
  const dayIndex = $derived(Math.min(day, daysInMonth) - 1);

  function onSelect(data: ScrollItemSelectPayload): void {
    if (data.type === 'y' && typeof data.value === 'number') year = data.value;
    if (data.type === 'm' && typeof data.value === 'number') month = data.value;
    if (data.type === 'd' && typeof data.value === 'number') day = data.value;
    // 换年/月后夹回合法日。
    if (day > daysInMonth) day = daysInMonth;
  }
</script>

<div style="width: 300px">
  <ScrollList header="日期选择">
    <ScrollItem mode="wheel" list={years} type="y" selectedIndex={yearIndex} {onSelect} ariaLabel="年" />
    <ScrollItem mode="wheel" cycled list={months} type="m" selectedIndex={month} {onSelect} ariaLabel="月" />
    <ScrollItem mode="wheel" cycled list={days} type="d" selectedIndex={dayIndex} {onSelect} ariaLabel="日" />
  </ScrollList>
</div>

<div style="margin-top:8px">
  <Text type="tertiary">
    {year} 年 {month + 1} 月 {Math.min(day, daysInMonth)} 日
  </Text>
</div>
