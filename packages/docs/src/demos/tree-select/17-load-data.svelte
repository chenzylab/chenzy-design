<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import type { TreeNode } from './_data';

  const initialData: TreeNode[] = [
    { label: '亚洲', value: 'Asia', key: '0', isLeaf: false },
    { label: '欧洲', value: 'Europe', key: '1', isLeaf: false },
  ];

  let counter = 0;
  const loadData = (node: TreeNode): Promise<TreeNode[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const id = counter++;
        resolve([
          { label: `${node.label} - 子级 ${id}`, value: `${node.value}-${id}`, key: `${node.key}-${id}`, isLeaf: true },
        ]);
      }, 1000);
    });
  };
</script>

<TreeSelect
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  treeData={initialData}
  {loadData}
  placeholder="点击节点异步加载子级"
/>
