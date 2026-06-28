<script lang="ts">
  import { Tree, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      key: 'design',
      label: '设计',
      children: [
        { key: 'figma', label: 'Figma 规范' },
        { key: 'token', label: 'Design Token' },
      ],
    },
    {
      key: 'dev',
      label: '研发',
      children: [
        { key: 'fe', label: '前端' },
        {
          key: 'be',
          label: '后端',
          children: [
            { key: 'api', label: 'API' },
            { key: 'db', label: '数据库' },
          ],
        },
      ],
    },
    { key: 'qa', label: '测试' },
  ];

  let selected = $state<string | number>('figma');
  let checked = $state<(string | number)[]>([]);
</script>

<div style="display:flex; gap:48px; flex-wrap:wrap; align-items:flex-start">
  <div style="width:240px">
    <Text type="tertiary">单选</Text>
    <Tree
      {treeData}
      defaultExpandAll
      value={selected}
      onChange={(info) => (selected = info.value as string | number)}
      ariaLabel="部门树"
    />
    <Text type="tertiary">已选：{selected}</Text>
  </div>

  <div style="width:240px">
    <Text type="tertiary">可勾选（父子联动）+ 可搜索</Text>
    <Tree
      {treeData}
      checkable
      filterable
      defaultExpandAll
      checkedKeys={checked}
      onCheck={(info) => (checked = info.checked)}
      ariaLabel="可勾选部门树"
    />
    <Text type="tertiary">已勾选 {checked.length} 项</Text>
  </div>
</div>
