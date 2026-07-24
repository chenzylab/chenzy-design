<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';
  import type { TreeNode } from './_data';

  // 大量树节点：开启虚拟化优化性能。
  const treeData: TreeNode[] = Array.from({ length: 100 }, (_, i) => ({
    label: `省份 ${i}`,
    value: `p-${i}`,
    key: `p-${i}`,
    children: Array.from({ length: 10 }, (_, j) => ({
      label: `城市 ${i}-${j}`,
      value: `c-${i}-${j}`,
      key: `c-${i}-${j}`,
    })),
  }));
</script>

<TreeSelect
  style="width: 300px"
  {treeData}
  filterTreeNode
  showFilteredOnly
  virtualize={{ height: 300, width: 300, itemSize: 28 }}
  placeholder="虚拟化大数据树"
/>
