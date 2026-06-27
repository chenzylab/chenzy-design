<script lang="ts">
  import { Tag } from '@chenzy-design/svelte';

  let tags = $state(['标签一', '标签二', '标签三']);

  function remove(name: string) {
    tags = tags.filter((t) => t !== name);
  }
</script>

<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; min-height: 24px;">
  {#each tags as name (name)}
    <Tag color="primary" closable onClose={() => remove(name)}>{name}</Tag>
  {/each}
  {#if tags.length === 0}
    <span style="font-size: 12px; color: #86909c;">全部关闭啦</span>
  {/if}
</div>
