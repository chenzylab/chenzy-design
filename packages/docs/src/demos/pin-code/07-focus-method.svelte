<script lang="ts">
  import { PinCode, Button, Space } from '@chenzy-design/svelte';

  let pin = $state<ReturnType<typeof PinCode> | undefined>(undefined);
</script>

<Space vertical align="start">
  <!-- 命令式 focus(index)/blur(index)：聚焦/失焦第 index 格 -->
  <Space>
    <Button size="small" onclick={() => pin?.focus(0)}>聚焦第 1 格</Button>
    <Button size="small" onclick={() => pin?.focus(2)}>聚焦第 3 格</Button>
    <Button size="small" type="tertiary" onclick={() => pin?.blur()}>失焦</Button>
  </Space>
  <PinCode bind:this={pin} format="mixed" defaultValue="69af41" autoFocus={false} />
</Space>
