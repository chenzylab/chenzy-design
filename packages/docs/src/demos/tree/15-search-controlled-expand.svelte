<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import type { TreeNodeData, TreeKey } from '@chenzy-design/core';

  const treeData: TreeNodeData[] = [
    {
      label: '亚洲',
      value: 'Asia',
      key: '0',
      children: [
        {
          label: '中国',
          value: 'China',
          key: '0-0',
          children: [
            {
              label: '北京',
              value: 'Beijing',
              key: '0-0-0',
            },
            {
              label: '上海',
              value: 'Shanghai',
              key: '0-0-1',
            },
          ],
        },
        {
          label: '日本',
          value: 'Japan',
          key: '0-1',
        },
      ],
    },
    {
      label: '北美洲',
      value: 'North America',
      key: '1',
    },
  ];

  let expandedKeys = $state<TreeKey[]>([]);
</script>

<Tree
  style="width: 300px"
  {treeData}
  filterTreeNode
  {expandedKeys}
  onExpand={(keys) => (expandedKeys = keys)}
  onSearch={(_value, filteredExpandedKeys) => (expandedKeys = [...filteredExpandedKeys])}
/>
