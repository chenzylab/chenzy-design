<script lang="ts">
  import { TreeSelect, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      key: 'asia',
      label: '亚洲',
      children: [
        { key: 'cn', label: '中国' },
        { key: 'jp', label: '日本' },
      ],
    },
    {
      key: 'europe',
      label: '欧洲',
      children: [
        { key: 'fr', label: '法国' },
        { key: 'de', label: '德国' },
      ],
    },
  ];

  let v1 = $state<string | number | null>(null);
  let v2 = $state<string | number | null>(null);
</script>

<div style="display: flex; gap: 24px; flex-wrap: wrap">
  <div style="width: 220px">
    <Text type="tertiary">defaultExpandAll：初始即展开全部</Text>
    <TreeSelect
      {treeData}
      value={v1}
      defaultExpandAll
      placeholder="选择国家"
      onChange={(k) => (v1 = Array.isArray(k) ? (k[0] ?? null) : k)}
    />
  </div>
  <div style="width: 220px">
    <Text type="tertiary">expandAll：受控动态展开全部</Text>
    <TreeSelect
      {treeData}
      value={v2}
      expandAll
      placeholder="选择国家"
      onChange={(k) => (v2 = Array.isArray(k) ? (k[0] ?? null) : k)}
    />
  </div>
</div>
