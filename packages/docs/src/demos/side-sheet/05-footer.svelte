<script lang="ts">
  import { SideSheet, Button, Input, Text } from '@chenzy-design/svelte';

  let open = $state(false);
  let keyword = $state('');
  let result = $state('');

  function apply(close: () => void) {
    result = keyword ? `已应用筛选：${keyword}` : '已清空筛选';
    close();
  }
</script>

<div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap">
  <Button type="primary" onclick={() => (open = true)}>高级筛选</Button>
  {#if result}
    <Text type="tertiary">{result}</Text>
  {/if}
</div>

<SideSheet
  {open}
  placement="right"
  title="高级筛选"
  onOpenChange={(e) => (open = e.open)}
>
  <Text>Footer 暴露 close()，按钮可关闭面板并保留表单数据。</Text>
  <div style="margin-top:12px">
    <Input placeholder="关键词" bind:value={keyword} />
  </div>
  {#snippet footer({ close })}
    <Button onclick={close}>取消</Button>
    <Button type="primary" onclick={() => apply(close)}>应用筛选</Button>
  {/snippet}
</SideSheet>
