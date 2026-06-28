<script lang="ts">
  import { ColorPicker, Text, Space, Button } from '@chenzy-design/svelte';

  const brandPresets = [
    '#3366ff',
    '#16a34a',
    '#ef4444',
    '#f59e0b',
    '#8b5cf6',
    '#0ea5e9',
    '#ec4899',
    '#64748b',
  ];

  let color = $state('#3366ff');
</script>

<Space direction="vertical" align="start">
  <Space>
    <ColorPicker
      value={color}
      presets={brandPresets}
      recentColors
      recentMax={6}
      onChange={(c) => (color = c)}
    />
    <Text type="tertiary">已选：{color}</Text>
  </Space>

  <Space>
    {#each brandPresets.slice(0, 4) as preset (preset)}
      <Button size="small" onclick={() => (color = preset)}>{preset}</Button>
    {/each}
  </Space>
</Space>
