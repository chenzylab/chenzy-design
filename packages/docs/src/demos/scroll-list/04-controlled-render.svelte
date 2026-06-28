<script lang="ts">
  import { ScrollList, Button, Space, Text } from '@chenzy-design/svelte';

  const data = [
    { value: 'xs', label: '超小杯' },
    { value: 'sm', label: '小杯' },
    { value: 'md', label: '中杯' },
    { value: 'lg', label: '大杯' },
    { value: 'xl', label: '超大杯' },
  ];

  let current = $state<string | number>('md');
</script>

<Space>
  <Button size="small" onclick={() => (current = 'xs')}>选超小杯</Button>
  <Button size="small" onclick={() => (current = 'xl')}>选超大杯</Button>
</Space>
<div style="width: 120px; margin-top: 8px">
  <ScrollList
    {data}
    value={current}
    ariaLabel="杯型"
    onChange={(info) => (current = info.value as string | number)}
  >
    {#snippet renderItem({ item, selected })}
      <span style="font-weight: {selected ? 600 : 400}">
        {selected ? '☕ ' : ''}{item.label}
      </span>
    {/snippet}
  </ScrollList>
</div>
<Text type="tertiary">受控值：{current}</Text>
