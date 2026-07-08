<script lang="ts">
  import { TreeSelect, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      key: 'asia',
      label: '亚洲',
      children: [
        { key: 'cn', label: '中国' },
        { key: 'jp', label: '日本' },
        { key: 'kr', label: '韩国' },
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

  let value = $state<string | number | null>(null);
</script>

<div style="width: 260px">
  <!-- searchPosition='trigger'：搜索输入框内嵌在触发器内，而非浮层顶部 -->
  <TreeSelect
    {treeData}
    {value}
    showClear
    filterTreeNode
    searchPosition="trigger"
    defaultExpandAll
    placeholder="搜索国家"
    onChange={(k) => (value = Array.isArray(k) ? (k[0] ?? null) : k)}
  />
  <Text type="tertiary">搜索框内嵌触发器，当前：{value ?? '（未选）'}</Text>
</div>
