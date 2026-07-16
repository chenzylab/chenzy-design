<script lang="ts">
  import { TreeSelect, Text } from '@chenzy-design/svelte';
  import type { TreeNode, TreeKey } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      key: 'asia',
      label: '亚洲',
      children: [
        {
          key: 'china',
          label: '中国',
          children: [
            { key: 'bj', label: '北京' },
            { key: 'sh', label: '上海' },
          ],
        },
        { key: 'jp', label: '日本' },
      ],
    },
    { key: 'na', label: '北美洲' },
  ];

  // 展开受控：expandedKeys 完全控制展开态，搜索不再自动展开。
  // 用 onSearch 的 filteredExpandedKeys 入参手动并入命中链，实现搜索展开。
  let expandedKeys = $state<TreeKey[]>([]);
</script>

<div style="width: 300px">
  <TreeSelect
    {treeData}
    filterTreeNode
    {expandedKeys}
    placeholder="搜索节点（展开受控）"
    onExpand={(keys) => (expandedKeys = keys)}
    onSearch={(input, filteredExpandedKeys) => {
      expandedKeys = [...new Set([...filteredExpandedKeys, ...expandedKeys])];
    }}
  />
  <Text type="tertiary">展开受控：搜索时用 onSearch 的 filteredExpandedKeys 并入展开集。</Text>
</div>
