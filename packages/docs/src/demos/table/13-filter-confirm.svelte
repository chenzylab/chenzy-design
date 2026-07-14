<!-- 筛选确认模式：filterConfirmMode='confirm'，勾选后点「确定」才应用，可多选后一次性生效 -->
<script lang="ts">
  import { Table } from '@chenzy-design/svelte';
  import type { Snippet } from 'svelte';

  type Row = {
    key: string;
    name: string;
    size: number;
    owner: string;
    [k: string]: unknown;
  };

  const columns = [
    {
      dataIndex: 'name',
      title: '标题',
      width: 260,
      // 确认模式：面板底部出现「确定 / 重置」，点确定后才应用
      filterConfirmMode: 'confirm' as const,
      filterMultiple: true,
      filters: [
        { text: 'Semi Design 设计稿', value: 'Semi Design' },
        { text: 'Semi Pro 设计稿', value: 'Semi Pro' },
      ],
      onFilter: (value: string | number, record: Row) => record.name.includes(String(value)),
    },
    {
      dataIndex: 'size',
      title: '大小',
      align: 'right' as const,
      sorter: (a: Row, b: Row) => a.size - b.size,
      render: sizeCell as Snippet<[{ value: unknown; record: Row; index: number }]>,
    },
    {
      dataIndex: 'owner',
      title: '所有者',
      filterConfirmMode: 'confirm' as const,
      filterMultiple: true,
      filters: [
        { text: '姜鹏志', value: '姜鹏志' },
        { text: '郝宣', value: '郝宣' },
      ],
      onFilter: (value: string | number, record: Row) => record.owner === value,
    },
  ];

  const data: Row[] = [
    { key: '1', name: 'Semi Design 设计稿1.fig', size: 128, owner: '姜鹏志' },
    { key: '2', name: 'Semi Pro 首页1.fig', size: 64, owner: '郝宣' },
    { key: '3', name: 'Semi Design 设计稿2.fig', size: 199, owner: '姜鹏志' },
    { key: '4', name: 'Semi Pro 首页2.fig', size: 32, owner: '郝宣' },
    { key: '5', name: 'Semi Design 设计稿3.fig', size: 88, owner: '姜鹏志' },
  ];
</script>

{#snippet sizeCell({ value }: { value: unknown; record: Row; index: number })}
  {value} KB
{/snippet}

<Table {columns} dataSource={data} rowKey="key" bordered />
