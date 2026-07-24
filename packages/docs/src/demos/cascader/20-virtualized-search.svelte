<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import type { TreeNode } from './_data';

  // 大量节点：搜索结果面板开启虚拟化优化性能。
  const treeData: TreeNode[] = Array.from({ length: 1000 }, (_, i) => ({
    label: `省份 ${i}`,
    value: `p-${i}`,
    children: [{ label: `城市 ${i}`, value: `c-${i}`, children: [{ label: `区县 ${i}`, value: `d-${i}` }] }],
  }));
</script>

<Cascader
  style="width: 300px"
  {treeData}
  filterTreeNode
  virtualizeInSearch={{ height: 300, width: 300, itemSize: 36 }}
  placeholder="搜索结果虚拟化"
/>
