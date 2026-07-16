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

  let related = $state<(string | number)[]>([]);
  let unrelated = $state<(string | number)[]>([]);
</script>

<div style="display:flex; gap:32px; align-items:flex-start">
  <div style="width:220px">
    <Text type="tertiary" size="small">related（默认）：父子联动 + 半选</Text>
    <Tree
      style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box"
      {treeData}
      multiple
      checkRelation="related"
      defaultExpandAll
      value={related}
      onChange={(value) => (related = value as (string | number)[])}
      ariaLabel="联动勾选树"
    />
  </div>
  <div style="width:220px">
    <Text type="tertiary" size="small">unRelated：父子互不影响、无半选</Text>
    <Tree
      style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box"
      {treeData}
      multiple
      checkRelation="unRelated"
      defaultExpandAll
      value={unrelated}
      onChange={(value) => (unrelated = value as (string | number)[])}
      ariaLabel="非联动勾选树"
    />
  </div>
</div>
