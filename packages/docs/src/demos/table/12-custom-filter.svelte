<!-- 自定义表头筛选：单选筛选（filterMultiple:false），一次只能选一个筛选项 -->
<script lang="ts">
  import { Table, Tag } from '@chenzy-design/svelte';
  import type { Snippet } from 'svelte';

  type Row = {
    key: string;
    name: string;
    size: number;
    status: 'success' | 'wait';
    owner: string;
    [k: string]: unknown;
  };

  const statusMeta: Record<Row['status'], { label: string; color: 'green' | 'orange' }> = {
    success: { label: '已交付', color: 'green' },
    wait: { label: '待评审', color: 'orange' },
  };

  const columns = [
    { dataIndex: 'name', title: '标题', width: 240 },
    {
      dataIndex: 'size',
      title: '大小',
      align: 'right' as const,
      sorter: (a: Row, b: Row) => a.size - b.size,
      render: sizeCell as Snippet<[{ value: unknown; record: Row; index: number }]>,
    },
    {
      dataIndex: 'status',
      title: '交付状态',
      // 单选筛选：一次只能选中一个筛选项
      filterMultiple: false,
      filters: [
        { text: '已交付', value: 'success' },
        { text: '待评审', value: 'wait' },
      ],
      onFilter: (value: string | number, record: Row) => record.status === value,
      render: statusCell as Snippet<[{ value: unknown; record: Row; index: number }]>,
    },
    {
      dataIndex: 'owner',
      title: '所有者',
      // 单选筛选：所有者也只能选一个
      filterMultiple: false,
      filters: [
        { text: '姜鹏志', value: '姜鹏志' },
        { text: '郝宣', value: '郝宣' },
      ],
      onFilter: (value: string | number, record: Row) => record.owner === value,
    },
  ];

  const data: Row[] = [
    { key: '1', name: 'Semi Design 设计稿.fig', size: 128, status: 'success', owner: '姜鹏志' },
    { key: '2', name: 'Semi D2C 首页.fig', size: 64, status: 'wait', owner: '郝宣' },
    { key: '3', name: 'Semi Design 组件库.fig', size: 199, status: 'success', owner: '姜鹏志' },
    { key: '4', name: 'Semi D2C 详情页.fig', size: 32, status: 'wait', owner: '郝宣' },
    { key: '5', name: 'Semi Design 图标集.fig', size: 88, status: 'success', owner: '姜鹏志' },
  ];
</script>

{#snippet sizeCell({ value }: { value: unknown; record: Row; index: number })}
  {value} KB
{/snippet}

{#snippet statusCell({ value }: { value: unknown; record: Row; index: number })}
  {@const meta = statusMeta[value as Row['status']]}
  <Tag color={meta.color}>{meta.label}</Tag>
{/snippet}

<Table {columns} dataSource={data} rowKey="key" bordered />
