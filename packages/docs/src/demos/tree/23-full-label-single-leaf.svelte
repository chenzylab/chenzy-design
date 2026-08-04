<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import type { TreeNodeData } from '@chenzy-design/core';

  const treeData: TreeNodeData[] = [
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
    {
      label: '北美洲',
      key: 'north-america',
      children: [
        { label: '美国', key: 'united-states' },
        { label: '加拿大', key: 'canada' },
      ],
    },
  ];
</script>

<div style="width:260px">
  <!-- renderFullLabel：只有叶子节点单选，父节点仅起分组作用（点击父节点触发展开而非选中） -->
  <Tree
    style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box"
    {treeData}
    aria-label="叶子分组单选树"
    onChange={(...args) => console.log('change', ...args)}
  >
    {#snippet renderFullLabel(ctx)}
      <div
        class={ctx.className}
        style={ctx.style}
        role="treeitem"
        aria-selected={false}
        tabindex="-1"
        onclick={ctx.isLeaf ? ctx.onClick : ctx.onExpand}
        onkeydown={() => {}}
      >
        {@render ctx.expandIcon(ctx.expandStatus)}
        <span>{ctx.data.label}</span>
      </div>
    {/snippet}
  </Tree>
</div>
