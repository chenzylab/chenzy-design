<script lang="ts">
  import { Tree, Button } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const setA: TreeNode[] = [
    { label: '数据集 A', key: 'a', children: [{ label: 'A-1', key: 'a1' }, { label: 'A-2', key: 'a2' }] },
  ];
  const setB: TreeNode[] = [
    { label: '数据集 B', key: 'b', children: [{ label: 'B-1', key: 'b1' }, { label: 'B-2', key: 'b2' }, { label: 'B-3', key: 'b3' }] },
  ];

  let data = $state<TreeNode[]>(setA);
</script>

<div style="display:flex; flex-direction:column; gap:12px; width:260px">
  <div style="display:flex; gap:8px">
    <Button size="small" onclick={() => (data = setA)}>数据集 A</Button>
    <Button size="small" onclick={() => (data = setB)}>数据集 B</Button>
  </div>
  <Tree style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box" treeData={data} expandAll ariaLabel="动态更新数据树" />
</div>
