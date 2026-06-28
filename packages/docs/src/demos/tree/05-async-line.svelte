<script lang="ts">
  import { Tree, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  // 目录树 + 禁用节点 + 连接线
  const dirData: TreeNode[] = [
    {
      key: 'src',
      label: 'src',
      children: [
        { key: 'app.ts', label: 'app.ts' },
        {
          key: 'utils',
          label: 'utils',
          children: [
            { key: 'format.ts', label: 'format.ts' },
            { key: 'legacy.ts', label: 'legacy.ts（只读）', disabled: true },
          ],
        },
      ],
    },
    {
      key: 'dist',
      label: 'dist（构建产物）',
      disabled: true,
      children: [{ key: 'bundle.js', label: 'bundle.js' }],
    },
    { key: 'readme', label: 'README.md' },
  ];

  // 异步加载：每个非叶子节点展开时拉取子节点
  const asyncData: TreeNode[] = [
    { key: 'dept-1', label: '一级部门 A' },
    { key: 'dept-2', label: '一级部门 B' },
  ];

  function loadData(node: TreeNode): Promise<TreeNode[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { key: `${node.key}-a`, label: `${node.label} / 子项 1`, isLeaf: true },
          { key: `${node.key}-b`, label: `${node.label} / 子项 2`, isLeaf: true },
        ]);
      }, 700);
    });
  }
</script>

<div style="display:flex; gap:48px; flex-wrap:wrap; align-items:flex-start">
  <div style="width:260px">
    <Text type="tertiary">目录树（连接线 + 禁用节点）</Text>
    <Tree
      treeData={dirData}
      showLine
      defaultExpandAll
      ariaLabel="目录树"
    />
  </div>

  <div style="width:260px">
    <Text type="tertiary">异步加载子节点（展开时拉取）</Text>
    <Tree
      treeData={asyncData}
      {loadData}
      ariaLabel="异步加载树"
    />
    <Text type="tertiary">展开节点后 0.7s 加载子项</Text>
  </div>
</div>
