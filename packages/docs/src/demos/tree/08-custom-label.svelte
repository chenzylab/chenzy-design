<script lang="ts">
  import { Tree, Tag } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      label: '前端团队',
      key: 'fe',
      children: [
        { label: '张三', key: 'zhang' },
        { label: '李四', key: 'li' },
      ],
    },
    {
      label: '后端团队',
      key: 'be',
      children: [{ label: '王五', key: 'wang' }],
    },
  ];
</script>

<div style="width:260px">
  <!-- renderLabel snippet：自定义节点渲染（父节点加计数标签） -->
  <Tree style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box" {treeData} defaultExpandAll ariaLabel="自定义节点内容树">
    {#snippet renderLabel({ node })}
      <span style="display:inline-flex; align-items:center; gap:8px">
        {node.label}
        {#if node.children?.length}
          <Tag size="small" color="primary">{node.children.length} 人</Tag>
        {/if}
      </span>
    {/snippet}
  </Tree>
</div>
