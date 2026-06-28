<script lang="ts">
  import { TreeSelect, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      key: 'eng',
      label: '研发',
      children: [
        { key: 'fe', label: '前端' },
        { key: 'be', label: '后端' },
      ],
    },
    { key: 'design', label: '设计' },
  ];

  let value = $state<string | number | null>(null);
</script>

<div style="width: 240px">
  <TreeSelect
    {treeData}
    {value}
    clearable
    filterable
    placeholder="选择部门"
    onChange={(k) => (value = Array.isArray(k) ? (k[0] ?? null) : k)}
  />
  <Text type="tertiary">已选：{value ?? '（未选）'}</Text>
</div>
