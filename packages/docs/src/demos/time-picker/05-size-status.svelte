<script lang="ts">
  import { TimePicker, Text } from '@chenzy-design/svelte';
</script>

<div style="display:flex; flex-direction:column; gap:16px; max-width:240px">
  <div style="display:flex; flex-direction:column; gap:6px">
    <Text type="tertiary">small</Text>
    <TimePicker size="small" />
  </div>
  <div style="display:flex; flex-direction:column; gap:6px">
    <Text type="tertiary">large + 可清除</Text>
    <TimePicker size="large" showClear defaultValue="09:30:00" />
  </div>
  <div style="display:flex; flex-direction:column; gap:6px">
    <Text type="tertiary">error 状态</Text>
    <TimePicker validateStatus="error" placeholder="请选择时间" />
  </div>
  <div style="display:flex; flex-direction:column; gap:6px">
    <Text type="tertiary">禁用</Text>
    <TimePicker disabled defaultValue="14:00:00" />
  </div>
</div>
