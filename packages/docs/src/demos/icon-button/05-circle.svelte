<script lang="ts">
  import { IconButton } from '@chenzy-design/svelte';
</script>

{#snippet plus()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
{/snippet}
{#snippet check()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
{/snippet}

<div style="display: flex; gap: 8px; align-items: center;">
  <IconButton circle type="primary" theme="solid" icon={plus} ariaLabel="新增" />
  <IconButton circle type="secondary" icon={check} ariaLabel="确认" />
  <IconButton circle type="danger" theme="light" icon={plus} ariaLabel="删除" />
</div>
