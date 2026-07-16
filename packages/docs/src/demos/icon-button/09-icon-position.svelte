<script lang="ts">
  import { IconButton } from '@chenzy-design/svelte';
  import { IconArrowRight } from '@chenzy-design/icons';
</script>

{#snippet arrow()}<IconArrowRight />{/snippet}

<div style="display: flex; gap: 8px; align-items: center;">
  <IconButton icon={arrow} iconPosition="left">下一步</IconButton>
  <IconButton icon={arrow} iconPosition="right">下一步</IconButton>
</div>
