<script lang="ts">
  import { ColorPicker, Text, Space } from '@chenzy-design/svelte';

  let color = $state('#3366ff');
  let colorInline = $state('#16a34a');
</script>

<!-- 弹出触发 + presets + recentColors -->
<Space data-testid="colorpicker-demo">
  <ColorPicker
    value={color}
    presets={['#3366ff', '#16a34a', '#ef4444', '#f59e0b']}
    recentColors
    onChange={(c) => (color = c)}
  />
  <Text type="tertiary">颜色：{color}（吸管按需显示 + 最近用色）</Text>
</Space>

<!-- inline 模式 + defaultFormat -->
<Space align="start" style="margin-top: 12px" data-testid="colorpicker-inline">
  <ColorPicker
    inline
    value={colorInline}
    defaultFormat="rgb"
    presets={['#3366ff', '#16a34a', '#ef4444']}
    onChange={(c) => (colorInline = c)}
  />
  <Text type="tertiary">内联 + format 切换：{colorInline}</Text>
</Space>

<!-- status 校验态 -->
<div style="margin-top: 12px" data-testid="colorpicker-status">
  <Space>
    <ColorPicker status="warning" defaultValue="#f59e0b" />
    <ColorPicker status="error" defaultValue="#ef4444" />
    <Text type="tertiary">status 校验态（仅触发器边框）</Text>
  </Space>
</div>
