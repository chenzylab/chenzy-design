<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      label: '亚洲',
      key: '0',
      children: [
        {
          label: '中国',
          key: '0-0',
          children: [
            { label: '北京', key: '0-0-0' },
            { label: '上海', key: '0-0-1' },
          ],
        },
        { label: '日本', key: '0-1' },
      ],
    },
    { label: '北美洲', key: '1' },
  ];

  // 展开受控：传入 expandedKeys 后节点展开完全由 expandedKeys 驱动，
  // 搜索时不再自动展开命中祖先；利用 onSearch 的 filteredKeys 手动回写展开集。
  let expandedKeys = $state<(string | number)[]>([]);
</script>

<Tree
  style="width: 300px"
  {treeData}
  filterTreeNode
  expandedKeys={expandedKeys}
  onExpand={(keys) => (expandedKeys = keys)}
  onSearch={(_value, filteredExpandedKeys) => (expandedKeys = [...filteredExpandedKeys])}
  ariaLabel="展开受控可搜索树"
/>
