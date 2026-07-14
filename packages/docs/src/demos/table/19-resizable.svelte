<!-- 可伸缩列：column.resizable + width 让列头右侧出现拖拽手柄，拖拽实时改列宽。 -->
<script lang="ts">
  import { Table } from '@chenzy-design/svelte';
  import type { Snippet } from 'svelte';

  type Row = { key: string; name: string; size: number; owner: string; updateTime: string; [k: string]: unknown };

  const columns = [
    {
      dataIndex: 'name',
      title: '标题',
      width: 300,
      resizable: true,
      render: nameCell as Snippet<[{ value: unknown; record: Row; index: number }]>,
    },
    {
      dataIndex: 'size',
      title: '大小',
      width: 200,
      resizable: true,
      sorter: true,
      render: sizeCell as Snippet<[{ value: unknown; record: Row; index: number }]>,
    },
    { dataIndex: 'owner', title: '所有者', width: 200, resizable: true },
    { dataIndex: 'updateTime', title: '更新日期', width: 200, resizable: true },
  ];

  const data: Row[] = [
    { key: '0', name: 'Semi Design 设计稿0.fig', owner: '姜鹏志', size: 100, updateTime: '2022-01-01' },
    { key: '1', name: 'Semi D2C 设计稿1.fig', owner: '郝宣', size: 199, updateTime: '2022-01-02' },
    { key: '2', name: 'Semi Design 设计稿2.fig', owner: '姜鹏志', size: 2, updateTime: '2022-01-03' },
    { key: '3', name: 'Semi D2C 设计稿3.fig', owner: '郝宣', size: 3, updateTime: '2022-01-04' },
    { key: '4', name: 'Semi Design 设计稿4.fig', owner: '姜鹏志', size: 4, updateTime: '2022-01-05' },
  ];
</script>

{#snippet nameCell({ value }: { value: unknown; record: Row; index: number })}
  {value as string}
{/snippet}

{#snippet sizeCell({ value }: { value: unknown; record: Row; index: number })}
  {value} KB
{/snippet}

<Table {columns} dataSource={data} rowKey="key" bordered />
