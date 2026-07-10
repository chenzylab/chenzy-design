<script lang="ts">
  import { Tree, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  // 部分节点 disabled；disableStrictly 下禁用节点勾选态不受父/子联动改变
  const treeData: TreeNode[] = [
    {
      label: '亚洲',
      key: 'asia',
      children: [
        {
          label: '中国',
          key: 'china',
          children: [
            { label: '北京', key: 'beijing' },
            { label: '上海（禁用）', key: 'shanghai', disabled: true },
          ],
        },
        { label: '日本（禁用）', key: 'japan', disabled: true },
      ],
    },
  ];

  // 初始勾选一个 disabled 节点（上海）——disableStrictly 下它被锁定，父级显半选
  let checked = $state<(string | number)[]>(['shanghai']);
</script>

<div style="width:260px">
  <Text type="tertiary" size="small">disableStrictly：禁用节点勾选态被锁定，非禁用节点仍可正常勾选</Text>
  <Tree
    style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box"
    {treeData}
    multiple
    checkable
    disableStrictly
    defaultExpandAll
    checkedKeys={checked}
    onCheck={(info) => (checked = info.checked)}
    ariaLabel="严格禁用树"
  />
  <Text type="tertiary" size="small">已勾选 {checked.length} 项</Text>
</div>
