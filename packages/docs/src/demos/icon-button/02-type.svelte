<script lang="ts">
  import { IconButton } from '@chenzy-design/svelte';
</script>

{#snippet star()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
{/snippet}

<div style="display: flex; gap: 8px; align-items: center;">
  <IconButton type="primary" icon={star} ariaLabel="主要" />
  <IconButton type="secondary" icon={star} ariaLabel="次要" />
  <IconButton type="tertiary" icon={star} ariaLabel="第三" />
  <IconButton type="warning" icon={star} ariaLabel="警告" />
  <IconButton type="danger" icon={star} ariaLabel="危险" />
</div>
