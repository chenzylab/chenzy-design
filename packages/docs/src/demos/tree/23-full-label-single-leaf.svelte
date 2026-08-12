<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import type { TreeNodeData } from '@chenzy-design/core';

  const treeData: TreeNodeData[] = [
    {
      label: 'Asia',
      value: 'Asia',
      key: '0',
      children: [
        {
          label: 'China',
          value: 'China',
          key: '0-0',
          children: [
            {
              label: 'Beijing',
              value: 'Beijing',
              key: '0-0-0',
            },
            {
              label: 'Shanghai',
              value: 'Shanghai',
              key: '0-0-1',
            },
          ],
        },
        {
          label: 'Japan',
          value: 'Japan',
          key: '0-1',
          children: [
            {
              label: 'Osaka',
              value: 'Osaka',
              key: '0-1-0',
            },
          ],
        },
      ],
    },
    {
      label: 'North America',
      value: 'North America',
      key: '1',
      children: [
        {
          label: 'United States',
          value: 'United States',
          key: '1-0',
        },
        {
          label: 'Canada',
          value: 'Canada',
          key: '1-1',
        },
      ],
    },
  ];
</script>

<Tree {treeData} onChange={(value) => console.log(value)} style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border)">
  {#snippet renderFullLabel(ctx)}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class={ctx.className}
      style={ctx.style}
      role="treeitem"
      aria-selected={ctx.checkStatus.checked}
      tabindex="-1"
      onclick={ctx.isLeaf ? ctx.onClick : ctx.onExpand}
    >
      {@render ctx.expandIcon(ctx.expandStatus)}
      <span>{ctx.data.label}</span>
    </div>
  {/snippet}
</Tree>
