<script lang="ts">
  import { IconButton } from '@chenzy-design/svelte';
  import { IconPlus, IconEdit } from '@chenzy-design/icons';
</script>

{#snippet plus()}<IconPlus />{/snippet}
{#snippet edit()}<IconEdit />{/snippet}

<div style="display: flex; gap: 8px; align-items: center;">
  <IconButton icon={plus}>新增</IconButton>
  <IconButton theme="solid" icon={edit}>编辑</IconButton>
</div>
