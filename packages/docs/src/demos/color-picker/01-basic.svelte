<script lang="ts">
  import { ColorPicker, Text, Space } from '@chenzy-design/svelte';

  let color = $state('#3366ff');
</script>

<Space direction="vertical" align="start">
  <Space>
    <ColorPicker
      value={color}
      presets={['#3366ff', '#16a34a', '#ef4444', '#f59e0b']}
      recentColors
      onChange={(c) => (color = c)}
    />
    <Text type="tertiary">颜色：{color}</Text>
  </Space>

  <Space align="start">
    <ColorPicker
      inline
      value={color}
      presets={['#3366ff', '#16a34a', '#ef4444']}
      onChange={(c) => (color = c)}
    />
    <Text type="tertiary">内联模式</Text>
  </Space>
</Space>
