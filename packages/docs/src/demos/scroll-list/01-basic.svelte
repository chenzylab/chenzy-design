<script lang="ts">
  import { ScrollList, Text } from '@chenzy-design/svelte';

  const data = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0'),
    disabled: i === 3 || i === 4,
  }));

  let picked = $state<string | number>(9);
</script>

<Text type="tertiary">滚动 / 点击 / 方向键选择小时（03、04 禁用）</Text>
<div style="width: 80px; margin-top:8px">
  <ScrollList
    {data}
    defaultValue={9}
    ariaLabel="小时"
    onChange={(info) => (picked = info.value as string | number)}
  />
</div>
<Text type="tertiary">选中小时：{picked}</Text>
