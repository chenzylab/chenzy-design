<script lang="ts">
  import { Tree, Switch } from '@chenzy-design/svelte';
  import type { TreeNodeData } from '@chenzy-design/core';

  const treeData: TreeNodeData[] = [
    {
      label: 'parent-0',
      key: 'parent-0',
      children: [
        {
          label: 'leaf-0-0',
          key: 'leaf-0-0',
          children: [
            {
              label: 'leaf-0-0-0',
              key: 'leaf-0-0-0',
            },
            {
              label: 'leaf-0-0-1',
              key: 'leaf-0-0-1',
            },
            {
              label: 'leaf-0-0-2',
              key: 'leaf-0-0-2',
            },
          ],
        },
        {
          label: 'leaf-0-1',
          key: 'leaf-0-1',
        },
      ],
    },
    {
      label: 'parent-1',
      key: 'parent-1',
    },
  ];

  let show = $state(true);
</script>

<div style="display: flex; align-items: center; column-gap: 5px; margin-bottom: 5px">
  <strong>showLine</strong>
  <Switch checked={show} onChange={(v) => (show = v)} />
</div>
<Tree showLine={show} defaultExpandAll {treeData} style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border)" />
