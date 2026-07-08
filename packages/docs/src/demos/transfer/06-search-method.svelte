<script lang="ts">
  import { Transfer, Button, Space, Text } from '@chenzy-design/svelte';

  // 命令式搜索：bind:this 拿到 Transfer 实例，调 ref.search(value) 过滤左侧。
  const data = [
    { key: 'a', label: 'Apple' },
    { key: 'b', label: 'Apricot' },
    { key: 'c', label: 'Banana' },
    { key: 'd', label: 'Cherry' },
    { key: 'e', label: 'Avocado' },
  ];

  let ref = $state<ReturnType<typeof Transfer> | undefined>(undefined);
  let value = $state<(string | number)[]>([]);
</script>

<Space vertical align="start">
  <Space>
    <Button size="small" onclick={() => ref?.search('a')}>搜索 "a"</Button>
    <Button size="small" type="tertiary" onclick={() => ref?.search('')}>清空搜索</Button>
  </Space>
  <Transfer
    bind:this={ref}
    dataSource={data}
    {value}
    titles={['可选水果', '已选水果']}
    onChange={(keys) => (value = keys)}
  />
  <Text type="tertiary">点按钮命令式过滤左侧列表（匹配 label 包含项）</Text>
</Space>
