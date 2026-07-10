<script lang="ts">
  import { Tree, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      label: '亚洲',
      key: 'asia',
      children: [
        { label: '中国', key: 'china' },
        { label: '日本', key: 'japan' },
      ],
    },
    { label: '北美洲', key: 'na', children: [{ label: '美国', key: 'us' }] },
  ];
</script>

<div style="display:flex; gap:32px; align-items:flex-start">
  <div style="width:220px">
    <Text type="tertiary" size="small">blockNode（默认 true）：整行高亮</Text>
    <Tree
      style="border: 1px solid var(--cd-color-border); border-radius: 6px"
      {treeData}
      defaultExpandAll
      ariaLabel="整行高亮树"
    />
  </div>
  <div style="width:220px">
    <Text type="tertiary" size="small">blockNode=false：仅高亮 label</Text>
    <Tree
      style="border: 1px solid var(--cd-color-border); border-radius: 6px"
      {treeData}
      blockNode={false}
      defaultExpandAll
      ariaLabel="仅 label 高亮树"
    />
  </div>
</div>
