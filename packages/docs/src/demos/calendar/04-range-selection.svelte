<script lang="ts">
  import { Calendar, Text } from '@chenzy-design/svelte';

  const anchor = new Date(2026, 5, 1);
  let rangeText = $state('（未选）');
</script>

<Calendar
  selectionMode="range"
  defaultValue={anchor}
  defaultRangeValue={[new Date(2026, 5, 8), new Date(2026, 5, 12)]}
  onRangeChange={(info) => {
    const [a, b] = info.range;
    rangeText = `${a.toLocaleDateString('zh-CN')} ~ ${b.toLocaleDateString('zh-CN')}`;
  }}
/>
<Text type="tertiary">已选范围：{rangeText}</Text>
