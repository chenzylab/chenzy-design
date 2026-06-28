<script lang="ts">
  import { Transfer, Text } from '@chenzy-design/svelte';

  // pagination：左侧源面板分页（pageSize 控制每页条数），适合较长列表。
  // emptyContent 自定义两侧空态文案。
  const data = Array.from({ length: 28 }, (_, i) => ({
    key: `n${i + 1}`,
    label: `选项 ${String(i + 1).padStart(2, '0')}`,
  }));

  let value = $state<(string | number)[]>([]);
  let page = $state(1);
</script>

<Transfer
  dataSource={data}
  {value}
  titles={['可选（28 项 / 分页）', '已选']}
  pagination={{ pageSize: 8, onPageChange: (p) => (page = p) }}
  emptyContent={{ left: '没有更多可选项', right: '尚未选择任何项' }}
  onChange={(keys) => (value = keys)}
/>
<Text type="tertiary">当前页：{page} ｜ 已选 {value.length} 项</Text>
