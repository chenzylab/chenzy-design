<script lang="ts">
  import { Tree, Checkbox } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      label: '亚洲',
      key: 'asia',
      children: [
        {
          label: '中国',
          key: 'china',
          children: [
            { label: '北京', key: 'beijing' },
            { label: '上海', key: 'shanghai' },
          ],
        },
        { label: '日本', key: 'japan', children: [{ label: '大阪', key: 'osaka' }] },
      ],
    },
  ];
</script>

<div style="width:260px">
  <!-- renderFullLabel：只有叶子渲染勾选框（父节点仅分组），配合 multiple + leafOnly -->
  <Tree style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box" {treeData} multiple leafOnly defaultExpandAll ariaLabel="叶子分组勾选树">
    {#snippet renderFullLabel(ctx)}
      <div
        class={ctx.className}
        style={ctx.style}
        role="treeitem"
        aria-selected={false}
        tabindex="-1"
        onclick={ctx.isLeaf ? ctx.onCheck : ctx.onExpand}
        onkeydown={() => {}}
      >
        {#if !ctx.isLeaf}{@render ctx.expandIcon(ctx.expandStatus)}{/if}
        {#if ctx.isLeaf}
          <span style="margin-inline-end:8px">
            <Checkbox checked={ctx.checkStatus.checked} indeterminate={ctx.checkStatus.halfChecked} />
          </span>
        {/if}
        <span>{ctx.data.label}</span>
      </div>
    {/snippet}
  </Tree>
</div>
