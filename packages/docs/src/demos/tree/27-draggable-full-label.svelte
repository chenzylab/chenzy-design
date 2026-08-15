<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import { IconFixedStroked, IconSectionStroked, IconAbsoluteStroked, IconComponentStroked } from '@chenzy-design/icons';
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

  function reorder(
    list: TreeNodeData[],
    dragKey: TreeKey,
    dropKey: TreeKey,
    pos: 'before' | 'inside' | 'after',
  ): TreeNodeData[] {
    let dragged: TreeNodeData | undefined;
    const remove = (arr: TreeNodeData[]): TreeNodeData[] => {
      const out: TreeNodeData[] = [];
      for (const n of arr) {
        if (n.key === dragKey) {
          dragged = n;
          continue;
        }
        out.push(n.children ? { ...n, children: remove(n.children) } : n);
      }
      return out;
    };
    const pruned = remove(list);
    if (!dragged) return list;
    const insert = (arr: TreeNodeData[]): TreeNodeData[] => {
      const out: TreeNodeData[] = [];
      for (const n of arr) {
        if (n.key === dropKey) {
          if (pos === 'before') out.push(dragged as TreeNodeData, n);
          else if (pos === 'after') out.push(n, dragged as TreeNodeData);
          else out.push({ ...n, children: [...(n.children ?? []), dragged as TreeNodeData] });
        } else {
          out.push(n.children ? { ...n, children: insert(n.children) } : n);
        }
      }
      return out;
    };
    return insert(pruned);
  }

  let treeData = $state<TreeNodeData[]>([
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
          icon: sectionIcon,
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
  ] as unknown as TreeNodeData[]);
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
{#snippet componentIcon()}
  <IconComponentStroked style="margin-right: 8px; color: var(--cd-color-text-2)" />
{/snippet}

<Tree
  {treeData}
  draggable
  onDrop={(info) => {
    treeData = reorder(treeData, info.dragNode.key, info.dropNode.key, info.dropPosition);
  }}
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
  draggable: boolean;
  onDragStart: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onDragEnd: (e: DragEvent) => void;
})}
  {@const isLeaf = !(ctx.data.children && ctx.data.children.length)}
  {@const bg = selected.has(ctx.data.key)
    ? 'var(--cd-color-primary-light-default)'
    : selectedThroughParent.has(ctx.data.key)
      ? 'color-mix(in srgb, var(--cd-color-primary-light-default) 50%, transparent)'
      : 'transparent'}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- draggable + ondrag*：对齐 Semi renderFullLabel + draggable 场景 cloneElement 强制注入
       的拖拽属性——Tree 传了 draggable 时，自定义渲染的根节点也必须自己接上这些才能真正拖动。 -->
  <div
    class={ctx.className}
    role="treeitem"
    aria-selected={selected.has(ctx.data.key)}
    tabindex="-1"
    draggable={ctx.draggable}
    onclick={ctx.onClick}
    ondragstart={ctx.onDragStart}
    ondragover={ctx.onDragOver}
    ondragleave={ctx.onDragLeave}
    ondrop={ctx.onDrop}
    ondragend={ctx.onDragEnd}
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
