<!-- 表格分组：groupBy 定义分组规则，renderGroupSection 自定义分组表头渲染。 -->
<script lang="ts">
  import { Table } from '@chenzy-design/svelte';
  import type { Snippet } from 'svelte';

  type Row = { key: string; name: string; size: number; owner: string; updateTime: string; [k: string]: unknown };

  const columns = [
    { dataIndex: 'name', title: '标题', width: 300 },
    { dataIndex: 'size', title: '大小', render: sizeCell as Snippet<[{ value: unknown; record: Row; index: number }]> },
    { dataIndex: 'owner', title: '所有者' },
    { dataIndex: 'updateTime', title: '更新日期' },
  ];

  const data: Row[] = [
    { key: '0', name: 'Semi Design 设计稿0.fig', owner: '姜鹏志', size: 100, updateTime: '2022-01-01' },
    { key: '1', name: 'Semi D2C 设计稿1.fig', owner: '郝宣', size: 100, updateTime: '2022-01-02' },
    { key: '2', name: 'Semi Design 设计稿2.fig', owner: '姜鹏志', size: 105, updateTime: '2022-01-03' },
    { key: '3', name: 'Semi D2C 设计稿3.fig', owner: '郝宣', size: 105, updateTime: '2022-01-04' },
    { key: '4', name: 'Semi Design 设计稿4.fig', owner: '姜鹏志', size: 112, updateTime: '2022-01-05' },
    { key: '5', name: 'Semi D2C 设计稿5.fig', owner: '郝宣', size: 112, updateTime: '2022-01-06' },
  ];
</script>

{#snippet sizeCell({ value }: { value: unknown; record: Row; index: number })}
  {value} KB
{/snippet}

{#snippet groupSection({ groupKey }: { groupKey: string; group: Row[] })}
  <strong>根据文件大小分组 {groupKey} KB</strong>
{/snippet}

<Table
  {columns}
  dataSource={data}
  rowKey="key"
  groupBy="size"
  renderGroupSection={groupSection}
  clickGroupedRowToExpand
  scroll={{ y: 480 }}
/>
