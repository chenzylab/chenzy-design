<script lang="ts">
  import { Table } from '@chenzy-design/svelte';

  type Row = {
    key: number;
    name: string;
    score: number;
    [k: string]: unknown;
  };

  const columns = [
    { dataIndex: 'name', title: '选手' },
    {
      dataIndex: 'score',
      title: '得分',
      align: 'right' as const,
      sorter: (a: Row, b: Row) => a.score - b.score,
    },
  ];

  const data: Row[] = Array.from({ length: 23 }, (_, i) => ({
    key: i + 1,
    name: `选手 ${i + 1}`,
    score: Math.round(60 + ((i * 37) % 40)),
  }));

  let current = $state(1);
</script>

<Table
  {columns}
  dataSource={data}
  rowKey="key"
  bordered
  pagination={{
    pageSize: 8,
    current,
    onChange: (page) => (current = page),
  }}
/>
