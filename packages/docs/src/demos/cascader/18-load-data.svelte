<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import type { TreeNode } from './_data';

  const initialData: TreeNode[] = [
    { label: '浙江省', value: 'zhejiang', isLeaf: false } as TreeNode,
    { label: '江苏省', value: 'jiangsu', isLeaf: false } as TreeNode,
  ];

  let counter = 0;
  const loadData = (node: TreeNode): Promise<TreeNode[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const id = counter++;
        resolve([
          { label: `${node.label} - 子级 ${id}`, value: `${node.value}-${id}`, isLeaf: true } as TreeNode,
        ]);
      }, 1000);
    });
  };
</script>

<Cascader
  style="width: 300px"
  treeData={initialData}
  {loadData}
  placeholder="点击节点异步加载子级"
/>
