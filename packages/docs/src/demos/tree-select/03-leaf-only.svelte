<script lang="ts">
  import { TreeSelect, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      key: 'docs',
      label: '文档',
      children: [
        {
          key: 'guide',
          label: '指南',
          children: [
            { key: 'install', label: '安装' },
            { key: 'quickstart', label: '快速上手' },
          ],
        },
        {
          key: 'api',
          label: 'API',
          children: [
            { key: 'props', label: 'Props' },
            { key: 'events', label: 'Events' },
          ],
        },
      ],
    },
  ];

  let value = $state<string | number | null>('install');
</script>

<div style="width: 260px">
  <TreeSelect
    {treeData}
    {value}
    leafOnly
    filterable
    defaultExpandAll
    placeholder="只能选择叶子节点"
    onChange={(k) => (value = Array.isArray(k) ? (k[0] ?? null) : k)}
  />
  <Text type="tertiary">仅叶子可选，当前：{value ?? '（未选）'}</Text>
</div>
