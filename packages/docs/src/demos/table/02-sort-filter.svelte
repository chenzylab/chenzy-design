<script lang="ts">
  import { Table } from '@chenzy-design/svelte';

  type Row = {
    key: number;
    name: string;
    age: number;
    dept: string;
    [k: string]: unknown;
  };

  const columns = [
    { dataIndex: 'name', title: '姓名' },
    {
      dataIndex: 'age',
      title: '年龄',
      align: 'right' as const,
      sorter: (a: Row, b: Row) => a.age - b.age,
      defaultSortOrder: 'ascend' as const,
    },
    {
      dataIndex: 'dept',
      title: '部门',
      filters: [
        { text: '工程', value: '工程' },
        { text: '设计', value: '设计' },
        { text: '市场', value: '市场' },
      ],
      onFilter: (value: string | number, record: Row) => record.dept === value,
    },
  ];

  const data: Row[] = [
    { key: 1, name: '陈一', age: 32, dept: '工程' },
    { key: 2, name: '林二', age: 28, dept: '设计' },
    { key: 3, name: '王三', age: 45, dept: '工程' },
    { key: 4, name: '赵四', age: 23, dept: '市场' },
    { key: 5, name: '孙五', age: 38, dept: '设计' },
    { key: 6, name: '周六', age: 30, dept: '市场' },
  ];
</script>

<Table {columns} dataSource={data} rowKey="key" bordered />
