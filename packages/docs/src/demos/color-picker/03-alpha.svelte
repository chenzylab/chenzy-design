<script lang="ts">
  import { ColorPicker, Text, Space } from '@chenzy-design/svelte';

  let withAlpha = $state('#3366ffcc');
  let noAlpha = $state('#16a34a');
</script>

<Space direction="vertical" align="start">
  <Space>
    <ColorPicker
      alpha
      defaultFormat="rgb"
      value={withAlpha}
      onChange={(c) => (withAlpha = c)}
    />
    <Text type="tertiary">带透明度：{withAlpha}</Text>
  </Space>

  <Space>
    <ColorPicker
      alpha={false}
      value={noAlpha}
      onChange={(c) => (noAlpha = c)}
    />
    <Text type="tertiary">关闭透明度：{noAlpha}</Text>
  </Space>
</Space>
