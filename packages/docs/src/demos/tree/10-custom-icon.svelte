<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import { IconMapPin } from '@chenzy-design/icons';
  import type { TreeNodeData } from '@chenzy-design/core';
</script>

{#snippet mapPinIcon()}
  <IconMapPin style="color: var(--cd-color-text-2)" />
{/snippet}

<Tree
  treeData={[
    {
      label: 'Asia',
      value: 'Asia',
      key: '0',
      icon: mapPinIcon,
      children: [
        {
          label: 'China',
          value: 'China',
          key: '0-0',
          icon: mapPinIcon,
        },
        {
          label: 'Japan',
          value: 'Japan',
          key: '0-1',
          icon: mapPinIcon,
        },
      ],
    },
  ] as unknown as TreeNodeData[]}
  style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border)"
/>
