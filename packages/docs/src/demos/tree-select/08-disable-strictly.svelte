<script lang="ts">
  import { TreeSelect, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      key: 'cn',
      label: '中国',
      children: [
        { key: 'sh', label: '上海' },
        { key: 'hz', label: '杭州（禁用）', disabled: true },
        { key: 'nj', label: '南京' },
      ],
    },
    {
      key: 'us',
      label: '美国',
      children: [
        { key: 'ny', label: '纽约' },
        { key: 'la', label: '洛杉矶' },
      ],
    },
  ];

  let value = $state<Array<string | number>>([]);
</script>

<div style="width: 300px">
  <!-- disableStrictly：勾选父节点「中国」不会连带勾选 disabled 的「杭州」 -->
  <TreeSelect
    {treeData}
    {value}
    multiple
    disableStrictly
    clearable
    defaultExpandAll
    placeholder="选择城市"
    onChange={(k) => (value = Array.isArray(k) ? k : k == null ? [] : [k])}
  />
  <Text type="tertiary">
    严格禁用：勾选父节点不影响 disabled 子节点。已选 {value.length} 项：{value.join('、') || '（未选）'}
  </Text>
</div>
