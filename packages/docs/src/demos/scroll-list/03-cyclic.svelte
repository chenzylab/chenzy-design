<script lang="ts">
  import { ScrollList, Text } from '@chenzy-design/svelte';

  const data = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1).padStart(2, '0'),
  }));

  let picked = $state<string | number>(1);
</script>

<Text type="tertiary">循环滚动：到头尾可继续翻动（月份 01–12）</Text>
<div style="width: 80px; margin-top: 8px">
  <ScrollList
    {data}
    cyclic
    defaultValue={1}
    ariaLabel="月份"
    onChange={(info) => (picked = info.value as string | number)}
  />
</div>
<Text type="tertiary">选中月份：{String(picked).padStart(2, '0')}</Text>
