<script lang="ts">
  import { Transfer, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      key: 'east',
      label: '华东',
      children: [
        { key: 'hz', label: '杭州' },
        { key: 'nj', label: '南京' },
        { key: 'sh', label: '上海' },
      ],
    },
    {
      key: 'south',
      label: '华南',
      children: [
        { key: 'gz', label: '广州' },
        { key: 'sz', label: '深圳' },
      ],
    },
    { key: 'cd', label: '成都' },
  ];

  let value = $state<(string | number)[]>(['hz']);
</script>

<!-- 树穿梭框：type='treeList'，源面板内嵌复用 Tree 组件，仅叶子迁移；showPath 显示完整路径 -->
<Transfer type="treeList" showPath dataSource={treeData} {value} onChange={(keys) => (value = keys)} />
<Text type="tertiary">已选叶子：{value.join(', ') || '（无）'}</Text>
