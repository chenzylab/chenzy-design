<script lang="ts">
  import { Tree, Button } from '@chenzy-design/svelte';
  import type { TreeNodeData } from '@chenzy-design/core';

  let treeData = $state<TreeNodeData[]>([{ key: '0', label: 'item-0', value: '0' }]);

  function add() {
    const itemLength = Math.floor(Math.random() * 5) + 1;
    treeData = new Array(itemLength).fill(0).map((_v, i) => {
      const length = Math.floor(Math.random() * 3);
      const children: TreeNodeData[] = new Array(length).fill(0).map((_cv, ci) => ({
        key: `${i}-${ci}`,
        label: `Leaf-${i}-${ci}`,
        value: `${i}-${ci}`,
      }));
      return {
        key: `${i}`,
        label: `Item-${i}`,
        value: `${i}`,
        children,
      };
    });
  }
</script>

<div style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border)">
  <Tree {treeData} />
  <br />
  <Button onClick={add} style="margin: 20px">动态改变数据</Button>
</div>
