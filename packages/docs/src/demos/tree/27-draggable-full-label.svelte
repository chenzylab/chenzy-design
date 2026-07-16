<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import { IconFixedStroked, IconSectionStroked, IconComponentStroked } from '@chenzy-design/icons';
  import type { TreeNode } from '@chenzy-design/svelte';

  type DragNode = { key: string; label: string; icon?: 'fixed' | 'section' | 'component'; children?: DragNode[] };

  let data = $state<DragNode[]>([
    { key: 'fix-btn-0', label: '黑色固定按钮', icon: 'fixed' },
    {
      key: 'module-0',
      label: '模块',
      icon: 'section',
      children: [
        { key: 'free-compo-0', label: '可自由摆放的组件', icon: 'section' },
        {
          key: 'split-col-0',
          label: '分栏容器',
          icon: 'section',
          children: [
            { key: 'btn-0', label: '按钮组件', icon: 'component' },
            { key: 'btn-1', label: '按钮组件', icon: 'component' },
          ],
        },
      ],
    },
    {
      key: 'module-1',
      label: '模块',
      icon: 'section',
      children: [{ key: 'cus-0', label: '自定义组件', icon: 'component' }],
    },
  ]);

  // 选中态：单选高亮当前节点，并同时高亮其子孙（selectedThroughParent）。
  let selected = $state<Set<string | number>>(new Set());
  let selectedThroughParent = $state<Set<string | number>>(new Set());

  function findDescendantKeys(node: DragNode): (string | number)[] {
    const res: (string | number)[] = [node.key];
    const walk = (item: DragNode) => item.children?.forEach((c) => (res.push(c.key), walk(c)));
    walk(node);
    return res;
  }

  function reorder(
    list: DragNode[],
    dragKey: string | number,
    dropKey: string | number,
    pos: 'before' | 'inside' | 'after',
  ): DragNode[] {
    let dragged: DragNode | undefined;
    const remove = (arr: DragNode[]): DragNode[] => {
      const out: DragNode[] = [];
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
    const insert = (arr: DragNode[]): DragNode[] => {
      const out: DragNode[] = [];
      for (const n of arr) {
        if (n.key === dropKey) {
          if (pos === 'before') out.push(dragged as DragNode, n);
          else if (pos === 'after') out.push(n, dragged as DragNode);
          else out.push({ ...n, children: [...(n.children ?? []), dragged as DragNode] });
        } else {
          out.push(n.children ? { ...n, children: insert(n.children) } : n);
        }
      }
      return out;
    };
    return insert(pruned);
  }
</script>

<Tree
  style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box"
  treeData={data as unknown as TreeNode[]}
  draggable
  defaultExpandAll
  ariaLabel="可拖拽高级定制树"
  onDrop={(d) => {
    data = reorder(data, d.dragNode.key, d.dropNode.key, d.dropPosition);
  }}
  onSelect={(key, _bool, node) => {
    selected = new Set([key]);
    selectedThroughParent = new Set(findDescendantKeys(node as unknown as DragNode));
  }}
>
  {#snippet renderFullLabel(ctx)}
    {@const node = ctx.data as unknown as DragNode}
    <div
      class={ctx.className}
      style={`${ctx.style ?? ''};background-color:${
        selected.has(node.key)
          ? 'var(--cd-color-primary-light-default)'
          : selectedThroughParent.has(node.key)
            ? 'var(--cd-color-primary-light-hover)'
            : 'transparent'
      }`}
      role="treeitem"
      aria-selected={selected.has(node.key)}
      tabindex="-1"
      onclick={ctx.onClick}
      onkeydown={() => {}}
    >
      {#if ctx.isLeaf}
        <span style="width:24px"></span>
      {:else}
        {@render ctx.expandIcon(ctx.expandStatus)}
      {/if}
      <span style="display:inline-flex;margin-inline-end:8px;color:var(--cd-color-text-2)">
        {#if node.icon === 'fixed'}<IconFixedStroked />
        {:else if node.icon === 'component'}<IconComponentStroked />
        {:else}<IconSectionStroked />{/if}
      </span>
      <span>{node.label}</span>
    </div>
  {/snippet}
</Tree>
