<script lang="ts">
  import { ColorPicker, Text, Space } from '@chenzy-design/svelte';

  type ColorFormat = 'hex' | 'rgb' | 'hsv' | 'hsl';

  let color = $state('#3366ff');
  let format = $state<ColorFormat>('hex');
</script>

<Space vertical align="start">
  <Space align="start">
    <ColorPicker
      inline
      value={color}
      format={format}
      onChange={(c) => (color = c)}
      onFormatChange={(f) => (format = f)}
    />
    <Space vertical align="start">
      <Text type="tertiary">当前格式：{format.toUpperCase()}</Text>
      <Text type="tertiary">颜色值：{color}</Text>
    </Space>
  </Space>
</Space>
