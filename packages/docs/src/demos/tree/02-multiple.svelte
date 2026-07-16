<script lang="ts">
  import { Tree, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

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
            { label: '上海', key: 'shanghai' },
          ],
        },
        { label: '日本', key: 'japan', children: [{ label: '大阪', key: 'osaka' }] },
      ],
    },
    {
      label: '北美洲',
      key: 'na',
      children: [
        { label: '美国', key: 'us' },
        { label: '加拿大', key: 'canada' },
      ],
    },
  ];

  let checked = $state<(string | number)[]>([]);
</script>

<div style="width:260px">
  <!-- multiple：渲染 checkbox，所有子项被选中时自动勾选父项，部分选中显半选；值走 value/onChange -->
  <Tree
    style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box"
    {treeData}
    multiple
    defaultExpandAll
    value={checked}
    onChange={(value) => (checked = value as (string | number)[])}
    ariaLabel="多选地区树"
  />
  <Text type="tertiary" size="small">已勾选 {checked.length} 项</Text>
</div>
