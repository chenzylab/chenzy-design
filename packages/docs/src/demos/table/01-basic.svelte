<script lang="ts">
  import { Table, Text } from '@chenzy-design/svelte';

  type Row = { key: number; name: string; age: number; city: string; [k: string]: unknown };

  const columns = [
    { dataIndex: 'name', title: '姓名', sorter: true },
    { dataIndex: 'age', title: '年龄', sorter: true, align: 'right' as const },
    { dataIndex: 'city', title: '城市' },
  ];

  const data: Row[] = [
    { key: 1, name: '陈一', age: 32, city: '杭州' },
    { key: 2, name: '林二', age: 28, city: '上海' },
    { key: 3, name: '王三', age: 45, city: '北京' },
    { key: 4, name: '赵四', age: 23, city: '深圳' },
    { key: 5, name: '孙五', age: 38, city: '广州' },
  ];

  let selected = $state<(string | number)[]>([]);
</script>

<Table
  {columns}
  dataSource={data}
  rowKey="key"
  bordered
  stripe
  rowSelection={{
    selectedRowKeys: selected,
    onChange: (keys) => (selected = keys),
  }}
/>
<Text type="tertiary">已选 {selected.length} 行</Text>
