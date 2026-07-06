<script lang="ts">
  import { IconButton } from '@chenzy-design/svelte';
</script>

{#snippet sparkles()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
{/snippet}

<div style="display: flex; gap: 8px; align-items: center;">
  <IconButton colorful type="primary" theme="solid" icon={sparkles} ariaLabel="AI 生成" />
  <IconButton colorful type="primary" theme="light" icon={sparkles} ariaLabel="AI 生成" />
  <IconButton colorful circle type="primary" theme="solid" icon={sparkles} ariaLabel="AI 生成" />
</div>
