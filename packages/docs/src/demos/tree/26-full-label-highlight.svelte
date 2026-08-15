<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import {
    IconFixedStroked,
    IconSectionStroked,
    IconAbsoluteStroked,
    IconInnerSectionStroked,
    IconComponentStroked,
  } from '@chenzy-design/icons';
  import type { TreeNodeData, TreeKey } from '@chenzy-design/core';

  let selected = $state<Set<TreeKey>>(new Set());
  let selectedThroughParent = $state<Set<TreeKey>>(new Set());

  function findDescendantKeys(node: TreeNodeData): TreeKey[] {
    const res: TreeKey[] = [node.key];
    function findChild(item: TreeNodeData | undefined) {
      if (!item?.children?.length) return;
      for (const child of item.children) {
        res.push(child.key);
        findChild(child);
      }
    }
    findChild(node);
    return res;
  }

  function handleSelect(_key: TreeKey, _selected: boolean, node: TreeNodeData) {
    selected = new Set([node.key]);
    selectedThroughParent = new Set(findDescendantKeys(node));
  }
</script>

{#snippet fixedBtnIcon()}
  <IconFixedStroked style="margin-right: 8px; color: var(--cd-color-text-2)" />
{/snippet}
{#snippet sectionIcon()}
  <IconSectionStroked style="margin-right: 8px; color: var(--cd-color-text-2)" />
{/snippet}
{#snippet absoluteIcon()}
  <IconAbsoluteStroked style="margin-right: 8px; color: var(--cd-color-text-2)" />
{/snippet}
{#snippet innerSectionIcon()}
  <IconInnerSectionStroked style="margin-right: 8px; color: var(--cd-color-text-2)" />
{/snippet}
{#snippet componentIcon()}
  <IconComponentStroked style="margin-right: 8px; color: var(--cd-color-text-2)" />
{/snippet}

<Tree
  treeData={[
    {
      label: '黑色固定按钮',
      icon: fixedBtnIcon,
      key: 'fix-btn-0',
    },
    {
      label: '模块',
      key: 'module-0',
      icon: sectionIcon,
      children: [
        {
          label: '可自由摆放的组件',
          icon: absoluteIcon,
          key: 'free-compo-0',
        },
        {
          label: '分栏容器',
          icon: innerSectionIcon,
          key: 'split-col-0',
          children: [
            {
              label: '按钮组件',
              icon: componentIcon,
              key: 'btn-0',
            },
            {
              label: '按钮组件',
              icon: componentIcon,
              key: 'btn-1',
            },
          ],
        },
      ],
    },
    {
      label: '模块',
      icon: sectionIcon,
      key: 'module-1',
      children: [
        {
          label: '自定义组件',
          icon: componentIcon,
          key: 'cus-0',
        },
      ],
    },
  ] as unknown as TreeNodeData[]}
  renderFullLabel={renderLabel}
  onSelect={handleSelect}
  style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border)"
  defaultExpandAll
/>

{#snippet renderLabel(ctx: {
  className: string;
  style: string | undefined;
  data: TreeNodeData;
  onClick: (e: MouseEvent) => void;
  expandIcon: any;
  expandStatus: { expanded: boolean; loading: boolean };
})}
  {@const isLeaf = !(ctx.data.children && ctx.data.children.length)}
  {@const bg = selected.has(ctx.data.key)
    ? 'var(--cd-color-primary-light-default)'
    : selectedThroughParent.has(ctx.data.key)
      ? 'color-mix(in srgb, var(--cd-color-primary-light-default) 50%, transparent)'
      : 'transparent'}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class={ctx.className}
    role="treeitem"
    aria-selected={selected.has(ctx.data.key)}
    tabindex="-1"
    onclick={ctx.onClick}
    style={[ctx.style, `background-color: ${bg}`].filter(Boolean).join('; ')}
  >
    {#if isLeaf}
      <span style="width: 24px"></span>
    {:else}
      {@render ctx.expandIcon(ctx.expandStatus)}
    {/if}
    {@render (ctx.data.icon as any)?.()}
    <span>{ctx.data.label}</span>
  </div>
{/snippet}
