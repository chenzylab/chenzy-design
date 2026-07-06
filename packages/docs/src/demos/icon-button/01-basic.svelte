<script lang="ts">
  import { IconButton } from '@chenzy-design/svelte';
</script>

{#snippet edit()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
{/snippet}
{#snippet trash()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
  </svg>
{/snippet}
{#snippet more()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
  </svg>
{/snippet}

<div style="display: flex; gap: 8px; align-items: center;">
  <IconButton type="primary" icon={edit} ariaLabel="编辑" />
  <IconButton type="danger" icon={trash} ariaLabel="删除" />
  <IconButton theme="borderless" icon={more} ariaLabel="更多操作" />
</div>
