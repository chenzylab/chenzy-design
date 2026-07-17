<script lang="ts">
  import { ColorPicker, Text, Space, colorValueFromHex, type ColorValue } from '@chenzy-design/svelte';

  // 值为 Semi ColorValue 对象 { hsva, rgba, hex }
  let color = $state<ColorValue>(colorValueFromHex('#39c5bb'));
</script>

<Space vertical align="start">
  <Space align="center">
    <!-- usePopover：默认色块 trigger 点击弹出面板 -->
    <ColorPicker usePopover value={color} onChange={(c) => (color = c)} />
    <Text type="tertiary">颜色：{color.hex}</Text>
  </Space>

  <Space align="start">
    <!-- 默认 inline：直接内联渲染面板 -->
    <ColorPicker value={color} onChange={(c) => (color = c)} />
    <Text type="tertiary">内联模式</Text>
  </Space>
</Space>
