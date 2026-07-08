<script lang="ts">
  import { TimePicker, Text } from '@chenzy-design/svelte';
</script>

<div style="display:flex; flex-direction:column; gap:12px">
  <div style="display:flex; align-items:center; gap:12px">
    <TimePicker defaultOpen />
    <Text type="tertiary">默认：面板底部含「此刻」按钮</Text>
  </div>
  <div style="display:flex; align-items:center; gap:12px">
    <TimePicker defaultOpen showNow={false} />
    <Text type="tertiary">showNow=false：隐藏「此刻」按钮</Text>
  </div>
</div>
