<script lang="ts">
  import { IconButton } from '@chenzy-design/svelte';
</script>

{#snippet plus()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
{/snippet}

<div style="display: flex; gap: 8px; align-items: center;">
  <IconButton type="primary" size="large" icon={plus} ariaLabel="新增（大）" />
  <IconButton type="primary" size="default" icon={plus} ariaLabel="新增（默认）" />
  <IconButton type="primary" size="small" icon={plus} ariaLabel="新增（小）" />
</div>
