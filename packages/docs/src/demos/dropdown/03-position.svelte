<script lang="ts">
  import { Dropdown, Button } from '@chenzy-design/svelte';
  import type { ComponentProps } from 'svelte';

  const items = [
    { key: '1', label: '菜单项 1' },
    { key: '2', label: '菜单项 2' },
    { key: '3', label: '菜单项 3' },
  ];

  type Position = NonNullable<ComponentProps<typeof Dropdown>['position']>;
  const positions: Position[] = ['bottomStart', 'bottom', 'bottomEnd', 'topStart', 'top', 'topEnd'];
</script>

<div style="display:flex; flex-wrap:wrap; gap:16px; padding:40px 0">
  {#each positions as position (position)}
    <Dropdown {items} {position} trigger="click">
      {#snippet triggerContent()}
        <Button type="tertiary">{position}</Button>
      {/snippet}
    </Dropdown>
  {/each}
</div>
