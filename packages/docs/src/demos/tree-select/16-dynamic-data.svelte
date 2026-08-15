<script lang="ts">
  import { TreeSelect, Button } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  let treeData = $state<TreeNode[]>([]);

  function add() {
    const itemLength = Math.floor(Math.random() * 5) + 1;
    treeData = new Array(itemLength).fill(0).map((_v, i) => {
      const length = Math.floor(Math.random() * 3);
      const children: TreeNode[] = new Array(length).fill(0).map((_cv, ci) => ({
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

<TreeSelect
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  placeholder="请选择"
/>
<br />
<br />
<Button onclick={add}>动态改变数据</Button>
