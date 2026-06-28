<script lang="ts">
  import { Transfer, Text } from '@chenzy-design/svelte';

  // type='groupList'：源数据按 { title, items } 分组，两侧均渲染分组头 + 计数。
  const data = [
    {
      title: '华东',
      items: [
        { key: 'hz', label: '杭州' },
        { key: 'nj', label: '南京' },
        { key: 'sh', label: '上海' },
        { key: 'su', label: '苏州' },
      ],
    },
    {
      title: '华南',
      items: [
        { key: 'gz', label: '广州' },
        { key: 'sz', label: '深圳' },
        { key: 'xm', label: '厦门' },
      ],
    },
    {
      title: '西南',
      items: [
        { key: 'cd', label: '成都' },
        { key: 'cq', label: '重庆' },
      ],
    },
  ];

  let value = $state<(string | number)[]>(['hz', 'gz']);
</script>

<Transfer
  type="groupList"
  dataSource={data}
  {value}
  titles={['可选城市', '已选城市']}
  onChange={(keys) => (value = keys)}
/>
<Text type="tertiary">已选：{value.join(', ') || '（无）'}</Text>
