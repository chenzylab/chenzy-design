<script lang="ts">
  import { TreeSelect, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  // 生成较大的树：8 个省，每省 12 个城市，共约 100 个节点
  const treeData: TreeNode[] = Array.from({ length: 8 }, (_, p) => ({
    key: `p-${p}`,
    label: `省份 ${p + 1}`,
    children: Array.from({ length: 12 }, (_, c) => ({
      key: `p-${p}-c-${c}`,
      label: `城市 ${p + 1}-${c + 1}`,
    })),
  }));

  let value = $state<string | number | null>(null);
</script>

<div style="width: 280px">
  <!-- virtualize 对象开启大数据树虚拟滚动：仅渲染视口内的行 -->
  <TreeSelect
    {treeData}
    {value}
    showClear
    defaultExpandAll
    virtualize={{ height: 224, itemSize: 32 }}
    placeholder="选择城市（大数据树）"
    onChange={(k) => (value = Array.isArray(k) ? (k[0] ?? null) : k)}
  />
  <Text type="tertiary">虚拟化：约 100 个节点，仅渲染视口内行。当前：{value ?? '（未选）'}</Text>
</div>
