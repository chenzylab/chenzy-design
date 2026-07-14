<!-- 表头合并：column.children 定义子列，父列 title 横跨其全部叶子列（对齐 Semi「表头合并」） -->
<script lang="ts">
  import { Table } from '@chenzy-design/svelte';

  type Row = {
    key: number;
    name: string;
    math: number;
    english: number;
    home: string;
    [k: string]: unknown;
  };

  const columns = [
    { title: '姓名', dataIndex: 'name', width: 120, fixed: 'left' as const },
    {
      title: '成绩',
      children: [
        { title: '数学', dataIndex: 'math', width: 100, align: 'right' as const, sorter: true },
        { title: '英语', dataIndex: 'english', width: 100, align: 'right' as const, sorter: true },
      ],
    },
    { title: '居住地', dataIndex: 'home', width: 140 },
  ];

  const data: Row[] = [
    { key: 1, name: '陈一', math: 92, english: 85, home: '杭州' },
    { key: 2, name: '林二', math: 78, english: 91, home: '上海' },
    { key: 3, name: '王三', math: 88, english: 76, home: '北京' },
    { key: 4, name: '赵四', math: 95, english: 89, home: '深圳' },
  ];
</script>

<Table {columns} dataSource={data} rowKey="key" bordered pagination={false} scroll={{ x: 560 }} />
