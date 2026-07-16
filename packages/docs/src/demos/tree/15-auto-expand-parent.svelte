<script lang="ts">
  import { Tree, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      label: '亚洲',
      key: 'asia',
      children: [
        { label: '中国', key: 'china', children: [{ label: '北京', key: 'beijing' }] },
      ],
    },
    { label: '北美洲', key: 'na', children: [{ label: '美国', key: 'us' }] },
  ];

  // 受控展开集，autoExpandParent 开启（对齐 Semi）：需先收起「中国」才能收起「亚洲」——
  // 因为中国仍展开时，亚洲作为其父被保持展开。受控需 onExpand 回填。
  let expanded = $state<(string | number)[]>(['asia', 'china']);
</script>

<div style="width:260px">
  <Text type="tertiary" size="small">autoExpandParent：需先收起「中国」才能收起「亚洲」</Text>
  <Tree
    style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box"
    {treeData}
    expandedKeys={expanded}
    autoExpandParent
    onExpand={(keys) => (expanded = keys)}
    ariaLabel="自动展开父节点树"
  />
</div>
