<script lang="ts">
  import { Tree, Button, Space, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      key: 'root',
      label: '文档',
      children: [
        {
          key: 'guide',
          label: '指南',
          children: [
            { key: 'intro', label: '快速上手' },
            { key: 'install', label: '安装' },
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

  let expanded = $state<(string | number)[]>(['root']);
  let selected = $state<string | number>('intro');
</script>

<div style="width:280px; display:flex; flex-direction:column; gap:8px">
  <Space>
    <Button size="small" onclick={() => (expanded = ['root', 'guide', 'api'])}>
      全部展开
    </Button>
    <Button size="small" onclick={() => (expanded = [])}>全部收起</Button>
    <Button size="small" onclick={() => (selected = 'props')}>选中 Props</Button>
  </Space>

  <Tree
    {treeData}
    expandedKeys={expanded}
    value={selected}
    onExpandedChange={(info) => (expanded = info.expanded)}
    onChange={(info) => (selected = info.value as string | number)}
    ariaLabel="受控文档树"
  />

  <Text type="tertiary">展开：{expanded.join('、') || '无'}</Text>
  <Text type="tertiary">选中：{selected}</Text>
</div>
