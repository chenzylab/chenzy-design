<script lang="ts">
  import { Tree, Switch } from '@chenzy-design/svelte';
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

  let showFilteredOnly = $state(false);
</script>

<span>showFilteredOnly</span>
<Switch checked={showFilteredOnly} onChange={(v) => (showFilteredOnly = v)} size="small" />
<br />
<Tree
  {treeData}
  multiple
  filterTreeNode
  {showFilteredOnly}
  style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border)"
/>
