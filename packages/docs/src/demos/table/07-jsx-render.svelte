<!-- 自定义渲染：首列 Avatar + 姓名组合，状态列用 Tag，操作列用 Button。对齐 Semi「自定义渲染」。 -->
<script lang="ts">
  import { Table, Avatar, Text, Tag, Button } from '@chenzy-design/svelte';
  import type { Snippet } from 'svelte';

  type Status = 'success' | 'pending' | 'wait';
  type Row = {
    key: string;
    name: string;
    size: string;
    status: Status;
    owner: string;
    avatarBg: 'grey' | 'red' | 'green' | 'light-blue';
    updateTime: string;
    [k: string]: unknown;
  };

  const statusMeta: Record<Status, { label: string; color: 'green' | 'orange' | 'blue' }> = {
    success: { label: '已交付', color: 'green' },
    pending: { label: '已延期', color: 'orange' },
    wait: { label: '待评审', color: 'blue' },
  };

  const columns = [
    { dataIndex: 'name', title: '标题', width: 260, render: nameCell as Snippet<[{ value: unknown; record: Row; index: number }]> },
    { dataIndex: 'size', title: '大小', width: 100 },
    { dataIndex: 'status', title: '交付状态', width: 120, render: statusCell as Snippet<[{ value: unknown; record: Row; index: number }]> },
    { dataIndex: 'owner', title: '所有者', width: 160, render: ownerCell as Snippet<[{ value: unknown; record: Row; index: number }]> },
    { dataIndex: 'updateTime', title: '更新日期', width: 160 },
    { dataIndex: 'operate', title: '', width: 80, render: operateCell as Snippet<[{ value: unknown; record: Row; index: number }]> },
  ];

  let data = $state<Row[]>([
    { key: '1', name: 'Semi Design 设计稿.fig', size: '2M', status: 'success', owner: '姜鹏志', avatarBg: 'grey', updateTime: '2020-02-02' },
    { key: '2', name: 'Semi Design 演示文稿', size: '2M', status: 'pending', owner: '郝宣', avatarBg: 'red', updateTime: '2020-01-17' },
    { key: '3', name: '设计文档', size: '34KB', status: 'wait', owner: 'Zoey', avatarBg: 'light-blue', updateTime: '2020-01-26' },
    { key: '4', name: 'D2C 设计文档', size: '34KB', status: 'success', owner: '姜琪', avatarBg: 'green', updateTime: '2020-01-26' },
  ]);

  function removeRecord(key: string) {
    data = data.filter((d) => d.key !== key);
  }
</script>

{#snippet nameCell({ value }: { value: unknown; record: Row; index: number })}
  <span style="display:flex;align-items:center;gap:8px">
    <Avatar size="small" shape="square" color="light-blue">S</Avatar>
    <Text ellipsis={{ showTooltip: true }} class="cell-name">{value as string}</Text>
  </span>
{/snippet}

<style>
  :global(.cell-name) {
    max-width: 180px;
  }
</style>

{#snippet statusCell({ value }: { value: unknown; record: Row; index: number })}
  {@const meta = statusMeta[value as Status]}
  <Tag color={meta.color}>{meta.label}</Tag>
{/snippet}

{#snippet ownerCell({ value, record }: { value: unknown; record: Row; index: number })}
  <span style="display:flex;align-items:center;gap:6px">
    <Avatar size="small" color={record.avatarBg}>{(value as string).slice(0, 1)}</Avatar>
    {value as string}
  </span>
{/snippet}

{#snippet operateCell({ record }: { value: unknown; record: Row; index: number })}
  <Button theme="borderless" size="small" onclick={() => removeRecord(record.key)}>删除</Button>
{/snippet}

<Table {columns} dataSource={data} rowKey="key" bordered pagination={false} />
