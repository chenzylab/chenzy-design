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

  let value = $state<string | number | null>('cn');
</script>

<div style="width: 280px">
  <TreeSelect
    {treeData}
    {value}
    clearable
    size="large"
    treeDefaultExpandedKeys={['asia']}
    placeholder="选择国家"
    onChange={(k) => (value = Array.isArray(k) ? (k[0] ?? null) : k)}
  >
    {#snippet prefix()}
      <span aria-hidden="true">🌍</span>
    {/snippet}
  </TreeSelect>
  <Text type="tertiary">带前缀图标 + 可清除，当前：{value ?? '（未选）'}</Text>
</div>
