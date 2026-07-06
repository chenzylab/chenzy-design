<script lang="ts">
  import { IconButton } from '@chenzy-design/svelte';
</script>

{#snippet heart()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
  </svg>
{/snippet}

<div style="display: flex; gap: 8px; align-items: center;">
  <IconButton type="primary" theme="light" icon={heart} ariaLabel="浅色" />
  <IconButton type="primary" theme="solid" icon={heart} ariaLabel="实底" />
  <IconButton type="primary" theme="borderless" icon={heart} ariaLabel="无背景" />
  <IconButton type="primary" theme="outline" icon={heart} ariaLabel="边框" />
</div>
