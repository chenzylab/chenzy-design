<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      label: 'Asia',
      key: '0',
      children: [
        {
          label: 'China',
          key: '0-0',
          children: [
            { label: 'Beijing', key: '0-0-0' },
            { label: 'Shanghai', key: '0-0-1' },
          ],
        },
        { label: 'Japan', key: '0-1', children: [{ label: 'Osaka', key: '0-1-0' }] },
      ],
    },
    {
      label: 'North America',
      key: '1',
      children: [
        { label: 'United States', key: '1-0' },
        { label: 'Canada', key: '1-1' },
      ],
    },
  ];

  // filterTreeNode 传函数：自定义命中逻辑（这里按 label 前缀匹配，区分大小写）。
  // 命中节点的祖先链自动展开。
  const startsWith = (input: string, node: TreeNode) =>
    node.label.toLowerCase().startsWith(input.toLowerCase());
</script>

<Tree
  style="width: 300px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box"
  {treeData}
  filterTreeNode={startsWith}
  defaultExpandAll
  ariaLabel="自定义过滤谓词树"
/>
