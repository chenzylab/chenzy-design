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

<div style="display: flex; gap: 32px; flex-wrap: wrap">
  <div style="display: flex; flex-direction: column; gap: 8px; width: 280px">
    <TreeSelect
      {treeData}
      value={v1}
      defaultExpandAll
      placeholder="选择国家"
      onChange={(k) => (v1 = Array.isArray(k) ? (k[0] ?? null) : k)}
    />
    <Text type="tertiary" size="small">defaultExpandAll：初始化时展开全部</Text>
  </div>
  <div style="display: flex; flex-direction: column; gap: 8px; width: 280px">
    <TreeSelect
      {treeData}
      value={v2}
      expandAll
      placeholder="选择国家"
      onChange={(k) => (v2 = Array.isArray(k) ? (k[0] ?? null) : k)}
    />
    <Text type="tertiary" size="small">expandAll：受控动态展开全部</Text>
  </div>
</div>
