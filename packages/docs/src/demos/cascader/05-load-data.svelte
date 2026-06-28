<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import type { CascaderNode } from '@chenzy-design/svelte';

  const treeData: CascaderNode[] = [
    { label: '节点 1', value: '1', isLeaf: false },
    { label: '节点 2', value: '2', isLeaf: false },
  ];

  async function loadData(node: CascaderNode): Promise<CascaderNode[]> {
    await new Promise((r) => setTimeout(r, 600));
    const depth = String(node.value).split('-').length;
    return [
      { label: `${node.label}-1`, value: `${node.value}-1`, isLeaf: depth >= 2 },
      { label: `${node.label}-2`, value: `${node.value}-2`, isLeaf: depth >= 2 },
    ];
  }
</script>

<div style="width: 240px">
  <Cascader {treeData} {loadData} clearable placeholder="点击节点动态加载" />
</div>
