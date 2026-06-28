<script lang="ts">
  import { ScrollList, Text } from '@chenzy-design/svelte';

  const years = Array.from({ length: 6 }, (_, i) => 2024 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const columns = [
    {
      data: years.map((y) => ({ value: y, label: `${y} 年` })),
      ariaLabel: '年',
    },
    {
      data: months.map((m) => ({ value: m, label: `${String(m).padStart(2, '0')} 月` })),
      cyclic: true,
      ariaLabel: '月',
    },
    {
      data: days.map((d) => ({ value: d, label: `${String(d).padStart(2, '0')} 日` })),
      cyclic: true,
      ariaLabel: '日',
    },
  ];

  let date = $state<(string | number)[]>([2024, 1, 1]);
</script>

<Text type="tertiary">模拟日期选择器（月 / 日循环滚动）</Text>
<div style="width: 280px; margin-top: 8px">
  <ScrollList
    {columns}
    rows={5}
    defaultValue={[2024, 1, 1]}
    onChange={(info) => (date = info.value as (string | number)[])}
  />
</div>
<Text type="tertiary">选中日期：{date[0]}-{String(date[1]).padStart(2, '0')}-{String(date[2]).padStart(2, '0')}</Text>
