<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

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
</script>

<div style="display: flex; flex-direction: column; gap: 12px; width: 300px">
  <TreeSelect {treeData} multiple size="small" placeholder="small" defaultExpandAll />
  <TreeSelect {treeData} multiple size="default" placeholder="default" defaultExpandAll />
  <TreeSelect {treeData} multiple size="large" placeholder="large" defaultExpandAll />
</div>
