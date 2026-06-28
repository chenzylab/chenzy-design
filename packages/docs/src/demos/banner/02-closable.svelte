<script lang="ts">
  import { Banner, Button } from '@chenzy-design/svelte';

  let open = $state(true);
</script>

<div style="display: flex; flex-direction: column; gap: 8px; max-width: 640px;">
  {#if !open}
    <Button onclick={() => (open = true)}>重新显示</Button>
  {/if}
  {#if open}
    <Banner
      type="warning"
      title="存储空间不足"
      description="请及时清理，否则将影响正常使用。"
      onClose={() => (open = false)}
    >
      {#snippet action({ close })}
        <Button type="primary" size="small" onclick={close}>立即清理</Button>
      {/snippet}
    </Banner>
  {/if}
</div>
