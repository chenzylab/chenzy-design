<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import type { TreeNodeData } from '@chenzy-design/core';

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
      ],
    },
    {
      label: '北美洲',
      value: 'North America',
      key: '1',
    },
  ];
</script>

<Tree {treeData} defaultExpandAll style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border)" />
