<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import type { TreeNodeData } from '@chenzy-design/core';

  const treeData: TreeNodeData[] = [
    {
      label: 'Expand to load',
      value: '0',
      key: '0',
    },
    {
      label: 'Expand to load',
      value: '1',
      key: '1',
    },
    {
      label: 'Leaf Node',
      value: '2',
      key: '2',
      isLeaf: true,
    },
  ];

  function loadData(node: TreeNodeData): Promise<TreeNodeData[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: 'Child Node', key: `${node.key}-0` },
          { label: 'Child Node', key: `${node.key}-1` },
        ]);
      }, 1000);
    });
  }
</script>

<Tree {treeData} {loadData} />
