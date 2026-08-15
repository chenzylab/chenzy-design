<script lang="ts">
  import { TreeSelect, Button } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  function generateData(x = 5, y = 4, z = 3) {
    // x：每一级下的节点总数。y：每级节点里有y个节点、存在子节点。z：树的level层级数（0表示一级）
    const gData: TreeNode[] = [];
    function loop(level: number, preKey: string | null, tns: TreeNode[]) {
      const pk = preKey ?? '0';
      const children: string[] = [];
      for (let i = 0; i < x; i++) {
        const key = `${pk}-${i}`;
        tns.push({ label: `${key}-标签`, key: `${key}-key`, value: `${key}-value` });
        if (i < y) children.push(key);
      }
      if (level < 0) return tns;
      const nextLevel = level - 1;
      children.forEach((key, index) => {
        (tns[index] as TreeNode).children = [];
        loop(nextLevel, key, (tns[index] as TreeNode).children as TreeNode[]);
      });
      return null;
    }
    loop(z, null, gData);

    function calcTotal(xx: number, yy: number, zz: number): number {
      function rec(n: number): number {
        return n >= 0 ? xx * yy ** n + rec(n - 1) : 0;
      }
      return rec(zz + 1);
    }
    return { gData, total: calcTotal(x, y, z) };
  }

  let treeData = $state<TreeNode[]>([]);
  let total = $state(0);

  function onGen() {
    const result = generateData();
    treeData = result.gData;
    total = result.total;
  }
</script>

<div style="padding: 0 20px">
  <Button onclick={onGen}>生成数据: </Button>
  <span>共 {total} 个节点</span>
  <br />
  <br />
  {#if treeData.length}
    <TreeSelect
      style="width: 300px"
      dropdownStyle="overflow: hidden"
      {treeData}
      filterTreeNode
      showFilteredOnly
      placeholder="Please select"
      virtualize={{ height: 236, itemSize: 28 }}
    />
  {/if}
</div>
