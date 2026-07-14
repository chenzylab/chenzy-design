<!-- 可展开的表格：expandable.expandedRowRender 展开行渲染每行详情。对齐 Semi「可以展开的表格」。 -->
<script lang="ts">
  import { Table, Avatar, Text, Tag } from '@chenzy-design/svelte';
  import type { Snippet } from 'svelte';

  type Row = {
    key: string;
    name: string;
    size: string;
    owner: string;
    avatarBg: 'grey' | 'red' | 'light-blue';
    updateTime: string;
    [k: string]: unknown;
  };

  const columns = [
    { dataIndex: 'name', title: '标题', width: 260, render: nameCell as Snippet<[{ value: unknown; record: Row; index: number }]> },
    { dataIndex: 'size', title: '大小', width: 100 },
    { dataIndex: 'owner', title: '所有者', width: 160, render: ownerCell as Snippet<[{ value: unknown; record: Row; index: number }]> },
    { dataIndex: 'updateTime', title: '更新日期', width: 160 },
  ];

  const data: Row[] = [
    { key: '1', name: 'Semi Design 设计稿.fig', size: '2M', owner: '姜鹏志', avatarBg: 'grey', updateTime: '2020-02-02' },
    { key: '2', name: 'Semi Design 演示文稿', size: '2M', owner: '郝宣', avatarBg: 'red', updateTime: '2020-01-17' },
    { key: '3', name: '设计文档', size: '34KB', owner: 'Zoey', avatarBg: 'light-blue', updateTime: '2020-01-26' },
  ];

  const detailMeta: Record<string, { users: string; retention: string; level: string; tag: string }> = {
    '1': { users: '1,480,000', retention: '98%', level: '3 级', tag: '设计' },
    '2': { users: '2,480,000', retention: '90%', level: '1 级', tag: '模板' },
    '3': { users: '2,920,000', retention: '98%', level: '2 级', tag: '文档' },
  };
</script>

{#snippet nameCell({ value }: { value: unknown; record: Row; index: number })}
  <span style="display:flex;align-items:center;gap:8px">
    <Avatar size="small" shape="square" color="light-blue">S</Avatar>
    {value as string}
  </span>
{/snippet}

{#snippet ownerCell({ value, record }: { value: unknown; record: Row; index: number })}
  <span style="display:flex;align-items:center;gap:6px">
    <Avatar size="small" color={record.avatarBg}>{(value as string).slice(0, 1)}</Avatar>
    {value as string}
  </span>
{/snippet}

{#snippet expandRow({ record }: { record: Row; index: number })}
  {@const detail = detailMeta[record.key]}
  <div style="display:flex;gap:24px;padding:8px 4px;flex-wrap:wrap">
    <span><Text type="tertiary">实际用户数量：</Text>{detail.users}</span>
    <span><Text type="tertiary">7 天留存：</Text>{detail.retention}</span>
    <span><Text type="tertiary">安全等级：</Text>{detail.level}</span>
    <span><Text type="tertiary">垂类标签：</Text><Tag>{detail.tag}</Tag></span>
  </div>
{/snippet}

<Table
  {columns}
  dataSource={data}
  rowKey="key"
  bordered
  pagination={false}
  expandable={{
    expandedRowRender: expandRow,
    defaultExpandedRowKeys: ['1'],
  }}
/>
