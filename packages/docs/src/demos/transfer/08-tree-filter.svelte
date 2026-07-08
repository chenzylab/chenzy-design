<script lang="ts">
  import { Transfer, Text } from '@chenzy-design/svelte';

  // treeProps.filterTreeNode：自定义树搜索逻辑，此处改为「按开头匹配」，
  // 区别于默认的「包含匹配」。在左侧搜索框输入 "北" 只命中以「北」开头的节点。
  const data = [
    {
      key: 'north',
      label: '华北',
      children: [
        { key: 'bj', label: '北京' },
        { key: 'tj', label: '天津' },
      ],
    },
    {
      key: 'east',
      label: '华东',
      children: [
        { key: 'sh', label: '上海' },
        { key: 'hb', label: '湖北' },
      ],
    },
  ];

  let value = $state<(string | number)[]>([]);
</script>

<Transfer
  type="treeList"
  treeProps={{
    filterTreeNode: (query, node) =>
      node.label.toLowerCase().startsWith(query.toLowerCase()),
  }}
  dataSource={data}
  {value}
  titles={['地区树', '已选']}
  onChange={(keys) => (value = keys)}
/>
<Text type="tertiary">treeProps.filterTreeNode 自定义搜索：改为按开头匹配（搜「北」命中北京，搜「京」无结果）</Text>
