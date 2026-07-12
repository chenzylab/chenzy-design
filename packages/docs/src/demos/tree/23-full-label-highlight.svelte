<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      label: '模块',
      key: 'm0',
      children: [
        { label: '自由摆放组件', key: 'free' },
        {
          label: '分栏容器',
          key: 'split',
          children: [
            { label: '按钮组件', key: 'btn0' },
            { label: '文本组件', key: 'btn1' },
          ],
        },
      ],
    },
  ];

  // 单选选中父节点时，同时高亮其所有子孙节点
  let selectedKey = $state<string | number | null>(null);
  let descendants = $state<Set<string | number>>(new Set());

  function collectKeys(node: TreeNode): (string | number)[] {
    const res: (string | number)[] = [node.key];
    for (const c of node.children ?? []) res.push(...collectKeys(c));
    return res;
  }
</script>

<div style="width:260px">
  <Tree
    style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box"
    {treeData}
    defaultExpandAll
    ariaLabel="单选高亮子节点树"
    onSelect={(key, _sel, node) => {
      selectedKey = key;
      descendants = new Set(collectKeys(node));
    }}
  >
    {#snippet renderFullLabel(ctx)}
      {@const inSubtree = descendants.has(ctx.data.key)}
      <div
        class={ctx.className}
        role="treeitem"
        aria-selected={ctx.data.key === selectedKey}
        tabindex="-1"
        style={`${ctx.style ?? ''}; background:${
          ctx.data.key === selectedKey
            ? 'var(--cd-color-primary-light-default)'
            : inSubtree
              ? 'var(--cd-color-primary-light-hover, rgba(0,100,250,.08))'
              : 'transparent'
        }`}
        onclick={ctx.onClick}
        onkeydown={() => {}}
      >
        {#if !ctx.isLeaf}{@render ctx.expandIcon(ctx.expandStatus)}{:else}<span style="width:12px; margin-inline-end:8px"></span>{/if}
        <span>{ctx.data.label}</span>
      </div>
    {/snippet}
  </Tree>
</div>
