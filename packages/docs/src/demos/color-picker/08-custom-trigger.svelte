<script lang="ts">
  import { ColorPicker, Button, Space, Text } from '@chenzy-design/svelte';

  let color = $state('#ef4444');
</script>

<Space align="center">
  <!-- children 自定义触发器：用任意元素替换默认色块 trigger -->
  <ColorPicker usePopover value={color} onChange={(c) => (color = c)}>
    <Button type="tertiary">
      <span style="display:inline-flex;align-items:center;gap:6px">
        <span style="width:12px;height:12px;border-radius:3px;background:{color}"></span>
        选择颜色
      </span>
    </Button>
  </ColorPicker>
  <Text type="tertiary">{color}</Text>
</Space>
