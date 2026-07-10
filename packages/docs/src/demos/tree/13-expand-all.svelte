<script lang="ts">
  import { Tree, Button, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const initial: TreeNode[] = [
    { label: '节点 1', key: 'n1', children: [{ label: '节点 1-1', key: 'n1-1' }] },
  ];

  let data = $state<TreeNode[]>(initial);
  let count = 1;

  function addNode() {
    count += 1;
    data = [
      ...data,
      { label: `节点 ${count}`, key: `n${count}`, children: [{ label: `节点 ${count}-1`, key: `n${count}-1` }] },
    ];
  }
</script>

<div style="display:flex; flex-direction:column; gap:12px">
  <Button size="small" onclick={addNode}>追加一个节点</Button>
  <Text type="tertiary" size="small">
    defaultExpandAll 追加后不再展开新节点；expandAll 追加后仍自动展开
  </Text>
  <div style="display:flex; gap:32px; align-items:flex-start">
    <div style="width:200px">
      <Text size="small">defaultExpandAll</Text>
      <Tree
        style="border: 1px solid var(--cd-color-border); border-radius: 6px"
        treeData={data}
        defaultExpandAll
        ariaLabel="defaultExpandAll 树"
      />
    </div>
    <div style="width:200px">
      <Text size="small">expandAll</Text>
      <Tree
        style="border: 1px solid var(--cd-color-border); border-radius: 6px"
        treeData={data}
        expandAll
        ariaLabel="expandAll 树"
      />
    </div>
  </div>
</div>
