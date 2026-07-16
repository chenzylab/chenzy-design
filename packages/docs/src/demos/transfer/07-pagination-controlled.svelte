<script lang="ts">
  import { Transfer, Button, Space, Text } from '@chenzy-design/svelte';

  const data = Array.from({ length: 100 }, (_, i) => ({
    key: `${i}`,
    label: `选项 ${i}`,
  }));

  let value = $state<(string | number)[]>([]);
  // 受控页码：由外部 state 驱动 pagination.currentPage。
  let page = $state(1);
</script>

<Space vertical align="start">
  <Space>
    <Button size="small" disabled={page <= 1} onclick={() => (page -= 1)}>上一页</Button>
    <Text>第 {page} 页</Text>
    <Button size="small" onclick={() => (page += 1)}>下一页</Button>
  </Space>
  <Transfer
    dataSource={data}
    {value}
    pagination={{ pageSize: 10, currentPage: page, onPageChange: (p) => (page = p) }}
    onChange={(keys) => (value = keys)}
  />
</Space>
