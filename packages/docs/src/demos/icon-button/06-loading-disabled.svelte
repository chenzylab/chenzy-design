<script lang="ts">
  import { IconButton } from '@chenzy-design/svelte';
</script>

{#snippet refresh()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" />
  </svg>
{/snippet}

<div style="display: flex; gap: 8px; align-items: center;">
  <IconButton type="primary" loading icon={refresh} ariaLabel="刷新中" />
  <IconButton type="primary" disabled icon={refresh} ariaLabel="刷新" />
</div>
