<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  // 异步加载：非叶子节点展开时调用 loadData 拉取子节点；叶子需标 isLeaf
  const treeData: TreeNode[] = [
    { label: '华东', key: 'east' },
    { label: '华南', key: 'south' },
    { label: '香港（叶子）', key: 'hk', isLeaf: true },
  ];

  function loadData(node: TreeNode): Promise<TreeNode[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: `${node.label}·城市 A`, key: `${node.key}-a`, isLeaf: true },
          { label: `${node.label}·城市 B`, key: `${node.key}-b`, isLeaf: true },
        ]);
      }, 800);
    });
  }
</script>

<div style="width:260px">
  <Tree style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box" {treeData} {loadData} ariaLabel="异步加载树" />
</div>
