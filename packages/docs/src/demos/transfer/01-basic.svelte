<script lang="ts">
  import { Transfer, Text } from '@chenzy-design/svelte';

  const data = [
    { key: 'a', label: '北京' },
    { key: 'b', label: '上海' },
    { key: 'c', label: '广州' },
    { key: 'd', label: '深圳' },
  ];

  let value = $state<(string | number)[]>(['b']);
</script>

<Transfer
  dataSource={data}
  {value}
  titles={['可选城市', '已选城市']}
  onChange={(keys) => (value = keys)}
/>
<Text type="tertiary">已选：{value.join(', ') || '（无）'}</Text>
