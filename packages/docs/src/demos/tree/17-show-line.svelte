<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      label: '亚洲',
      key: 'asia',
      children: [
        {
          label: '中国',
          key: 'china',
          children: [
            { label: '北京', key: 'beijing' },
            { label: '上海', key: 'shanghai' },
          ],
        },
        { label: '日本', key: 'japan', children: [{ label: '大阪', key: 'osaka' }] },
      ],
    },
    { label: '北美洲', key: 'na', children: [{ label: '美国', key: 'us' }] },
  ];
</script>

<div style="width:260px">
  <!-- showLine：节点之间的层级连接线（├ / └ / 竖线） -->
  <Tree style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box" {treeData} showLine showIcon={false} defaultExpandAll ariaLabel="连接线树" />
</div>
