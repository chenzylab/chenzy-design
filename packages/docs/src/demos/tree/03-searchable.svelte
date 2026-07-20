<script lang="ts">
  import { Tree, Text, Switch } from '@chenzy-design/svelte';
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

  let filteredOnly = $state(false);
</script>

<div style="display:flex; flex-direction:column; gap:12px; width:260px">
  <label style="display:flex; align-items:center; gap:8px">
    <Switch checked={filteredOnly} onChange={(v) => (filteredOnly = v)} size="small" />
    <Text size="small">showFilteredOnly（只展示命中结果）</Text>
  </label>
  <!-- filterTreeNode 开启搜索；默认对 label 搜索，命中高亮 + 自动展开祖先 -->
  <Tree
    style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box"
    {treeData}
    filterTreeNode
    showFilteredOnly={filteredOnly}
    defaultExpandAll
    ariaLabel="可搜索地区树"
  />
</div>
