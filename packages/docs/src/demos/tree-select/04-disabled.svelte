<script lang="ts">
  import { TreeSelect, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      key: 'team',
      label: '团队',
      children: [
        { key: 'alice', label: 'Alice' },
        { key: 'bob', label: 'Bob（停用）', disabled: true },
        { key: 'carol', label: 'Carol' },
      ],
    },
  ];

  let value = $state<string | number | null>(null);
</script>

<div style="display: flex; flex-direction: column; gap: 12px; width: 260px">
  <div>
    <Text type="tertiary">禁用单个节点</Text>
    <TreeSelect
      {treeData}
      {value}
      clearable
      defaultExpandAll
      placeholder="Bob 不可选"
      onChange={(k) => (value = Array.isArray(k) ? (k[0] ?? null) : k)}
    />
  </div>
  <div>
    <Text type="tertiary">整体禁用</Text>
    <TreeSelect
      {treeData}
      value="alice"
      disabled
      defaultExpandAll
      placeholder="整体禁用"
    />
  </div>
</div>
