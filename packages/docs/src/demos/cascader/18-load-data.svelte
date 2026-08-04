<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import type { CascaderNode } from '@chenzy-design/svelte';

  const initialData: CascaderNode[] = [
    { label: 'Node1', value: '0-0' },
    { label: 'Node2', value: '0-1' },
    { label: 'Node3', value: '0-2', isLeaf: true },
  ];

  let data = $state(initialData);

  function updateTreeData(list: CascaderNode[], value: string | number, children: CascaderNode[]): CascaderNode[] {
    return list.map((node) => {
      if (node.value === value) {
        return { ...node, children };
      }
      if (node.children) {
        return { ...node, children: updateTreeData(node.children, value, children) };
      }
      return node;
    });
  }

  async function loadData(selectedOpt: CascaderNode[]): Promise<void> {
    const targetOpt = selectedOpt[selectedOpt.length - 1] as CascaderNode;
    const { label, value } = targetOpt;
    if (targetOpt.children) {
      return;
    }
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        data = updateTreeData(data, value, [
          { label: `${label} - 1`, value: `${value}-1`, isLeaf: selectedOpt.length > 1 },
          { label: `${label} - 2`, value: `${value}-2`, isLeaf: selectedOpt.length > 1 },
        ]);
        resolve();
      }, 1000);
    });
  }
</script>

<Cascader style="width: 300px" treeData={data} {loadData} placeholder="Please select" />
