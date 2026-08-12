<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import type { TreeNodeData, TreeKey } from '@chenzy-design/core';

  let treeData = $state<TreeNodeData[]>([
    {
      label: 'Asia',
      value: 'Asia',
      key: '0',
      children: [
        {
          label: 'China',
          value: 'China',
          key: '0-0',
          children: [
            {
              label: 'Beijing',
              value: 'Beijing',
              key: '0-0-0',
            },
            {
              label: 'Shanghai',
              value: 'Shanghai',
              key: '0-0-1',
            },
          ],
        },
        {
          label: 'Japan',
          value: 'Japan',
          key: '0-1',
          children: [
            {
              label: 'Osaka',
              value: 'Osaka',
              key: '0-1-0',
            },
          ],
        },
      ],
    },
    {
      label: 'North America',
      value: 'North America',
      key: '1',
      children: [
        {
          label: 'United States',
          value: 'United States',
          key: '1-0',
        },
        {
          label: 'Canada',
          value: 'Canada',
          key: '1-1',
        },
      ],
    },
    {
      label: 'Europe',
      value: 'Europe',
      key: '2',
    },
  ]);

  // 对齐本库简化后的 onDrop 语义（dropPosition: 'before'|'inside'|'after'，
  // 取代 Semi 的 dropPosition:number + dropToGap:boolean 组合，效果等价）。
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
</script>

<Tree
  {treeData}
  draggable
  onDrop={(info) => {
    treeData = reorder(treeData, info.dragNode.key, info.dropNode.key, info.dropPosition);
  }}
/>
