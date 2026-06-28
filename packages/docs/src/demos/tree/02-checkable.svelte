<script lang="ts">
  import { Tree, Text } from '@chenzy-design/svelte';
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
            { key: 'beijing', label: '北京' },
            { key: 'shanghai', label: '上海' },
            { key: 'guangzhou', label: '广州' },
          ],
        },
        {
          key: 'japan',
          label: '日本',
          children: [
            { key: 'tokyo', label: '东京' },
            { key: 'osaka', label: '大阪' },
          ],
        },
      ],
    },
    {
      key: 'europe',
      label: '欧洲',
      children: [
        { key: 'london', label: '伦敦' },
        { key: 'paris', label: '巴黎' },
      ],
    },
  ];

  let related = $state<(string | number)[]>(['beijing']);
  let strict = $state<(string | number)[]>(['china']);
</script>

<div style="display:flex; gap:48px; flex-wrap:wrap; align-items:flex-start">
  <div style="width:240px">
    <Text type="tertiary">父子联动（related，含半选态）</Text>
    <Tree
      {treeData}
      checkable
      defaultExpandAll
      checkedKeys={related}
      onCheck={(info) => (related = info.checked)}
      ariaLabel="联动勾选地区树"
    />
    <Text type="tertiary">已勾选 {related.length} 项</Text>
  </div>

  <div style="width:240px">
    <Text type="tertiary">父子独立（checkStrictly，无半选）</Text>
    <Tree
      {treeData}
      checkable
      checkStrictly
      defaultExpandAll
      checkedKeys={strict}
      onCheck={(info) => (strict = info.checked)}
      ariaLabel="独立勾选地区树"
    />
    <Text type="tertiary">已勾选：{strict.join('、') || '无'}</Text>
  </div>
</div>
