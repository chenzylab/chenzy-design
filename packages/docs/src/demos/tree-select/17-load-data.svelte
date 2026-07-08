<script lang="ts">
  import { TreeSelect, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  // 顶层节点标 isLeaf: false，展开时经 loadData 异步取子节点
  const treeData: TreeNode[] = [
    { key: 'asia', label: '亚洲', isLeaf: false },
    { key: 'europe', label: '欧洲', isLeaf: false },
  ];

  const remoteChildren: Record<string, TreeNode[]> = {
    asia: [
      { key: 'cn', label: '中国' },
      { key: 'jp', label: '日本' },
      { key: 'kr', label: '韩国' },
    ],
    europe: [
      { key: 'fr', label: '法国' },
      { key: 'de', label: '德国' },
    ],
  };

  // loadData 返回 Promise，展开时动态加载子节点
  function loadData(node: TreeNode): Promise<TreeNode[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(remoteChildren[node.key] ?? []);
      }, 500);
    });
  }

  let value = $state<string | number | null>(null);
</script>

<div style="width: 280px">
  <TreeSelect
    {treeData}
    {value}
    {loadData}
    showClear
    placeholder="展开节点异步加载子级"
    onChange={(k) => (value = Array.isArray(k) ? (k[0] ?? null) : k)}
  />
  <Text type="tertiary">loadData 在展开时按需拉取子节点（约 500ms）。当前：{value ?? '（未选）'}</Text>
</div>
