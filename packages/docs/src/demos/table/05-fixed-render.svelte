<script lang="ts">
  import { Table, Tag } from '@chenzy-design/svelte';
  import type { Snippet } from 'svelte';

  type Row = {
    key: number;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'invited' | 'disabled';
    [k: string]: unknown;
  };

  const statusMeta: Record<Row['status'], { label: string; color: 'green' | 'orange' | 'red' }> = {
    active: { label: '已激活', color: 'green' },
    invited: { label: '待接受', color: 'orange' },
    disabled: { label: '已停用', color: 'red' },
  };

  const columns = [
    { dataIndex: 'name', title: '姓名', width: 120, fixed: 'left' as const },
    { dataIndex: 'email', title: '邮箱', width: 220 },
    { dataIndex: 'phone', title: '电话', width: 180 },
    {
      dataIndex: 'status',
      title: '状态',
      width: 120,
      fixed: 'right' as const,
      render: statusCell as Snippet<[{ value: unknown; record: Row; index: number }]>,
    },
  ];

  const data: Row[] = [
    { key: 1, name: '陈一', email: 'chen@example.com', phone: '138-0000-0001', status: 'active' },
    { key: 2, name: '林二', email: 'lin@example.com', phone: '138-0000-0002', status: 'invited' },
    { key: 3, name: '王三', email: 'wang@example.com', phone: '138-0000-0003', status: 'disabled' },
    { key: 4, name: '赵四', email: 'zhao@example.com', phone: '138-0000-0004', status: 'active' },
  ];
</script>

{#snippet statusCell({ value }: { value: unknown; record: Row; index: number })}
  {@const meta = statusMeta[value as Row['status']]}
  <Tag color={meta.color}>{meta.label}</Tag>
{/snippet}

<div style="max-width:520px">
  <Table {columns} dataSource={data} rowKey="key" bordered scroll={{ x: 640 }} />
</div>
