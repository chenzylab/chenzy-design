<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import type { TreeNode } from './_data';

  const treeData: TreeNode[] = [
    {
      label: 'Product',
      value: 'Product',
      children: [
        { label: 'Semi-Material', value: 'Semi-Material' },
        { label: 'Semi-DSM', value: 'Semi-DSM' },
        { label: 'Semi', value: 'Semi' },
        { label: 'Semi-C2D', value: 'Semi-C2D' },
        { label: 'Semi-D2C', value: 'Semi-D2C' },
      ],
    },
  ];
</script>

<div>
  <Cascader
    style="width: 300px"
    {treeData}
    placeholder="输入 s 查看排序效果"
    filterTreeNode
    filterSorter={(first, second, inputValue) => {
      const firstData = first.nodes[first.nodes.length - 1];
      const lastData = second.nodes[second.nodes.length - 1];
      if (firstData.label === inputValue) {
        return -1;
      } else if (lastData.label === inputValue) {
        return 1;
      } else {
        return firstData.label < lastData.label ? -1 : 1;
      }
    }}
  />
</div>
