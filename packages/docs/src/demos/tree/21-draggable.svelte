<script lang="ts">
  import { Tree, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  type DragNode = { key: string; label: string; children?: DragNode[] };

  let data = $state<DragNode[]>([
    { key: 'a', label: '一级 A', children: [{ key: 'a1', label: 'A-1' }, { key: 'a2', label: 'A-2' }] },
    { key: 'b', label: '一级 B', children: [{ key: 'b1', label: 'B-1' }] },
    { key: 'c', label: '一级 C' },
  ]);
  let info = $state('（未拖拽）');

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

<div style="width:260px">
  <Text type="tertiary" size="small">draggable：拖拽节点改变层级/顺序（before / inside / after）</Text>
  <Tree
    style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box"
    treeData={data as unknown as TreeNode[]}
    draggable
    defaultExpandAll
    showLine
    showIcon={false}
    ariaLabel="可拖拽树"
    onDrop={(d) => {
      data = reorder(data, d.dragNode.key, d.dropNode.key, d.dropPosition);
      info = `${d.dragNode.label} → ${d.dropNode.label}（${d.dropPosition}）`;
    }}
  />
  <Text type="tertiary" size="small">最近一次：{info}</Text>
</div>
