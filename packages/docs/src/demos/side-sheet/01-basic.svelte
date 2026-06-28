<script lang="ts">
  import { SideSheet, Button, Text } from '@chenzy-design/svelte';

  let open = $state(false);
  let reason = $state('');
</script>

<div style="display:flex; gap:12px; align-items:center">
  <Button type="primary" onclick={() => (open = true)}>打开侧边栏</Button>
  {#if reason}
    <Text type="tertiary">关闭原因：{reason}</Text>
  {/if}
</div>

<SideSheet
  {open}
  placement="right"
  title="编辑用户"
  onOpenChange={(e) => {
    open = e.open;
    reason = e.reason;
  }}
>
  <p style="margin:0; line-height:1.8">
    右侧滑入面板，支持焦点捕获、背景滚动锁定，Esc 或点击遮罩关闭。
  </p>
</SideSheet>
