<script lang="ts">
  import { Transfer, Text } from '@chenzy-design/svelte';

  // treeProps.expandAll=false：树默认收起子节点，需手动展开父节点。
  const data = [
    {
      key: 'east',
      label: '华东',
      children: [
        { key: 'hz', label: '杭州' },
        { key: 'nb', label: '宁波' },
        { key: 'nj', label: '南京' },
      ],
    },
    {
      key: 'south',
      label: '华南',
      children: [
        { key: 'gz', label: '广州' },
        { key: 'sz', label: '深圳' },
      ],
    },
  ];

  let value = $state<(string | number)[]>([]);
</script>

<Transfer
  type="treeList"
  treeProps={{ expandAll: false }}
  dataSource={data}
  {value}
  titles={['地区树（默认收起）', '已选']}
  onChange={(keys) => (value = keys)}
/>
<Text type="tertiary">treeProps.expandAll=false：初始收起子节点，点箭头展开</Text>
