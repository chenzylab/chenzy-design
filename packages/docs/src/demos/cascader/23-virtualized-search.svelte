<script lang="ts">
  import { Cascader, Text } from '@chenzy-design/svelte';
  import type { CascaderNode } from '@chenzy-design/svelte';

  // 生成超长树：50 个父节点 × 20 个叶子 = 1000 条可搜索路径。
  const treeData: CascaderNode[] = Array.from({ length: 50 }, (_, i) => ({
    label: `分组 ${i + 1}`,
    value: `g${i}`,
    children: Array.from({ length: 20 }, (_, j) => ({
      label: `选项 ${i + 1}-${j + 1}`,
      value: `g${i}-o${j}`,
    })),
  }));

  let value = $state<(string | number)[]>([]);
</script>

<div style="width: 280px">
  <Cascader
    {treeData}
    {value}
    showClear
    filterTreeNode
    virtualizeInSearch={{ height: 240, width: 280, itemSize: 32 }}
    placeholder="搜索（如「选项 3-5」）"
    onChange={(p) => (value = Array.isArray(p[0]) ? (p[0] as (string | number)[]) : (p as (string | number)[]))}
  />
  <Text type="tertiary">超长列表：virtualizeInSearch 虚拟滚动搜索结果</Text>
</div>
