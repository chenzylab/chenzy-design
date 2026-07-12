<script lang="ts">
  import { Avatar } from '@chenzy-design/svelte';

  const sizes = [
    'extra-extra-small',
    'extra-small',
    'small',
    'default',
    'medium',
    'large',
    'extra-large',
  ] as const;
</script>

<div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  {#each sizes as s (s)}
    <Avatar size={s} alt="用户">U</Avatar>
  {/each}
</div>
