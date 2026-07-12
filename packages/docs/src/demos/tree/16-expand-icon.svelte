<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      label: '亚洲',
      key: 'asia',
      children: [
        { label: '中国', key: 'china' },
        { label: '日本', key: 'japan' },
      ],
    },
    { label: '北美洲', key: 'na', children: [{ label: '美国', key: 'us' }] },
  ];
</script>

<div style="width:260px">
  <!-- expandIcon snippet：自定义展开/收起箭头（这里用 +/− 号） -->
  <Tree style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box" {treeData} defaultExpandAll ariaLabel="自定义展开图标树">
    {#snippet expandIcon({ expanded, loading })}
      <span style="font-weight:600; width:1em; text-align:center">
        {loading ? '…' : expanded ? '−' : '+'}
      </span>
    {/snippet}
  </Tree>
</div>
