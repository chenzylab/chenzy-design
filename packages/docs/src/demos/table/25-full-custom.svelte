<!-- 完全自定义渲染：用 render snippet 把整格替换为 Avatar + 富文本卡片式内容（对齐 Semi useFullRender 意图） -->
<script lang="ts">
  import { Table, Avatar, Text, Tag } from '@chenzy-design/svelte';
  import type { Snippet } from 'svelte';

  type Row = {
    key: number;
    name: string;
    email: string;
    role: string;
    status: 'online' | 'offline';
    [k: string]: unknown;
  };

  const data: Row[] = [
    { key: 1, name: '陈一', email: 'chen@example.com', role: '管理员', status: 'online' },
    { key: 2, name: '林二', email: 'lin@example.com', role: '编辑', status: 'offline' },
    { key: 3, name: '王三', email: 'wang@example.com', role: '访客', status: 'online' },
  ];

  const columns = [
    {
      dataIndex: 'name',
      title: '成员',
      render: userCell as Snippet<[{ value: unknown; record: Row; index: number }]>,
    },
    { dataIndex: 'role', title: '角色' },
    {
      dataIndex: 'status',
      title: '状态',
      align: 'right' as const,
      render: statusCell as Snippet<[{ value: unknown; record: Row; index: number }]>,
    },
  ];
</script>

{#snippet userCell({ record }: { value: unknown; record: Row; index: number })}
  <div style="display:flex;align-items:center;gap:12px">
    <Avatar size="small" color="blue">{record.name[0]}</Avatar>
    <div style="display:flex;flex-direction:column">
      <Text strong>{record.name}</Text>
      <Text type="tertiary" size="small">{record.email}</Text>
    </div>
  </div>
{/snippet}

{#snippet statusCell({ record }: { value: unknown; record: Row; index: number })}
  <Tag color={record.status === 'online' ? 'green' : 'grey'}>
    {record.status === 'online' ? '在线' : '离线'}
  </Tag>
{/snippet}

<Table {columns} dataSource={data} rowKey="key" pagination={false} />
