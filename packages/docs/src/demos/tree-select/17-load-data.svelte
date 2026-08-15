<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import type { TreeNode } from './_data';

  const initialData: TreeNode[] = [
    { label: 'Expand to load', value: '0', key: '0' },
    { label: 'Expand to load', value: '1', key: '1' },
    { label: 'Leaf Node', value: '2', key: '2', isLeaf: true },
  ];

  function loadData(node: TreeNode): Promise<TreeNode[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: 'Child Node', value: `${node.key}-0`, key: `${node.key}-0` },
          { label: 'Child Node', value: `${node.key}-1`, key: `${node.key}-1` },
        ]);
      }, 1000);
    });
  }
</script>

<TreeSelect
  {loadData}
  treeData={initialData}
  style="width: 300px"
  placeholder="请选择"
/>
