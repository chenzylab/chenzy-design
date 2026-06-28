<script lang="ts">
  import { Transfer, Text } from '@chenzy-design/svelte';

  // type='treeList' + showPath：源面板渲染树，勾父连带勾子叶子（半选态），
  // 仅叶子可迁移；showPath 让右侧已选项显示完整路径（如「华东 / 浙江 / 杭州」）。
  const data = [
    {
      key: 'east',
      label: '华东',
      children: [
        {
          key: 'zj',
          label: '浙江',
          children: [
            { key: 'hz', label: '杭州' },
            { key: 'nb', label: '宁波' },
          ],
        },
        {
          key: 'js',
          label: '江苏',
          children: [
            { key: 'nj', label: '南京' },
            { key: 'su', label: '苏州', disabled: true },
          ],
        },
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

  let value = $state<(string | number)[]>(['hz']);
</script>

<Transfer
  type="treeList"
  showPath
  dataSource={data}
  {value}
  titles={['地区树', '已选（含路径）']}
  onChange={(keys) => (value = keys)}
/>
<Text type="tertiary">已选叶子：{value.join(', ') || '（无）'}（苏州禁用不可勾）</Text>
