<script lang="ts">
  import { ColorPicker, Text, Space, colorValueFromHex, type ColorValue } from '@chenzy-design/svelte';

  let withAlpha = $state<ColorValue>(colorValueFromHex('#3366ffcc'));
  let noAlpha = $state<ColorValue>(colorValueFromHex('#16a34a'));
</script>

<Space vertical align="start">
  <Space align="start">
    <!-- alpha 开启：显示透明度滑条 + 百分比数字输入 -->
    <ColorPicker alpha value={withAlpha} onChange={(c) => (withAlpha = c)} />
    <Text type="tertiary">带透明度：{withAlpha.hex}（a={withAlpha.rgba.a}）</Text>
  </Space>

  <Space align="start">
    <ColorPicker alpha={false} value={noAlpha} onChange={(c) => (noAlpha = c)} />
    <Text type="tertiary">关闭透明度：{noAlpha.hex}</Text>
  </Space>
</Space>
