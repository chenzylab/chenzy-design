<script lang="ts">
  import { SideSheet, Button, Text, Input } from '@chenzy-design/svelte';

  let open = $state(false);
  let value = $state('');
</script>

<div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap">
  <Button type="primary" onclick={() => (open = true)}>打开协作面板</Button>
  <div style="width:220px">
    <Input placeholder="面板开着也能在这里输入" bind:value />
  </div>
</div>

<SideSheet
  {open}
  placement="right"
  mask={false}
  outsideClosable
  title="通知中心（非模态）"
  onOpenChange={(e) => (open = e.open)}
>
  <Text>
    mask=false：无遮罩、不锁背景滚动、不抢焦点，打开时仍可与主页面交互。点击面板外部关闭（outsideClosable）。
  </Text>
</SideSheet>
