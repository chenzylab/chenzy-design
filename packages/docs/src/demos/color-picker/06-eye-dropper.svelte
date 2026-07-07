<script lang="ts">
  import { ColorPicker, Text, Space } from '@chenzy-design/svelte';

  let color = $state('#39c5bb');
</script>

<Space vertical align="start">
  <!-- eyeDropper 开启浏览器吸管取色（需 HTTPS/localhost 且 Chromium>95，不支持时自动隐藏按钮） -->
  <Space>
    <ColorPicker
      value={color}
      eyeDropper
      alpha
      onChange={(c) => (color = c)}
    />
    <Text type="tertiary">颜色：{color}</Text>
  </Space>
  <Text type="tertiary">面板内「吸管」按钮可从屏幕任意位置取色（浏览器支持时显示）。</Text>
</Space>
