<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      label: '文档',
      key: 'docs',
      children: [
        { label: '入门指南', key: 'guide' },
        { label: 'API 参考', key: 'api' },
      ],
    },
    {
      label: '资源',
      key: 'assets',
      children: [{ label: 'logo.svg', key: 'logo' }],
    },
  ];
</script>

<div style="width:260px">
  <!-- icon snippet：自定义节点图标（文件夹展开/收起、文件） -->
  <Tree style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box" {treeData} defaultExpandAll ariaLabel="自定义图标树">
    {#snippet icon({ isLeaf, expanded })}
      <span>{isLeaf ? '📄' : expanded ? '📂' : '📁'}</span>
    {/snippet}
  </Tree>
</div>
