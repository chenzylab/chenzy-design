<script lang="ts">
  import { Tree, Button } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  // 大数据树：50 组 × 20 节点 = 1050 节点，虚拟化仅渲染视口内行
  const treeData: TreeNode[] = Array.from({ length: 50 }, (_, g) => ({
    key: `g${g}`,
    label: `分组 ${g + 1}`,
    children: Array.from({ length: 20 }, (_, c) => ({
      key: `g${g}-c${c}`,
      label: `分组 ${g + 1} · 节点 ${c + 1}`,
    })),
  }));

  let tree = $state<ReturnType<typeof Tree>>();
</script>

<div style="display:flex; flex-direction:column; gap:12px; width:300px">
  <Button size="small" onclick={() => tree?.scrollTo({ key: 'g40', align: 'start' })}>
    滚动到「分组 41」
  </Button>
  <Tree
    style="width: 260px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box"
    bind:this={tree}
    {treeData}
    virtualize={{ itemSize: 32, height: 320 }}
    defaultExpandAll
    ariaLabel="大数据虚拟树"
  />
</div>
