<script lang="ts">
  import { Popover } from '@chenzy-design/svelte';
  import { IconMore } from '@chenzy-design/icons';
  import type { BreadcrumbRoute } from '@chenzy-design/svelte';

  const separator = '-'; // 用于拼接 restItem 数组项的分隔符

  let { restItems }: { restItems: Array<{ route: BreadcrumbRoute; index: number }> } = $props();
</script>

<Popover showArrow style="padding:12px">
  {#snippet content()}
    <span>
      {#each restItems as item, idx (idx)}
        {item.route.name ?? ''}{#if idx !== restItems.length - 1}<span
            style="color:var(--cd-color-text-2); margin-right:6px">{separator}</span
          >{/if}
      {/each}
    </span>
  {/snippet}
  <IconMore />
</Popover>
