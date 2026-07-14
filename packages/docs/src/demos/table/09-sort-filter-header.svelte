<!-- 带排序和过滤功能的表头：标题列同时开启 sorter + filters，大小列仅排序。对齐 Semi「带排序和过滤功能的表头」。 -->
<script lang="ts">
  import { Table, Avatar } from '@chenzy-design/svelte';
  import type { Snippet } from 'svelte';

  type Row = {
    key: string;
    name: string;
    size: number;
    owner: string;
    avatarBg: 'grey' | 'red';
    [k: string]: unknown;
  };

  const columns = [
    {
      dataIndex: 'name',
      title: '标题',
      width: 260,
      render: nameCell as Snippet<[{ value: unknown; record: Row; index: number }]>,
      filters: [
        { text: 'Semi Design 设计稿', value: 'Semi Design 设计稿' },
        { text: 'Semi D2C 设计稿', value: 'Semi D2C 设计稿' },
      ],
      onFilter: (value: string | number, record: Row) => record.name.includes(String(value)),
      sorter: (a: Row, b: Row) => a.name.length - b.name.length,
    },
    {
      dataIndex: 'size',
      title: '大小',
      width: 120,
      align: 'right' as const,
      sorter: (a: Row, b: Row) => a.size - b.size,
      render: sizeCell as Snippet<[{ value: unknown; record: Row; index: number }]>,
    },
    {
      dataIndex: 'owner',
      title: '所有者',
      width: 160,
      render: ownerCell as Snippet<[{ value: unknown; record: Row; index: number }]>,
    },
  ];

  const data: Row[] = Array.from({ length: 6 }, (_, i) => {
    const isSemi = i % 2 === 0;
    return {
      key: String(i),
      name: isSemi ? `Semi Design 设计稿${i}.fig` : `Semi D2C 设计稿${i}.fig`,
      size: (i * 37) % 199,
      owner: isSemi ? '姜鹏志' : '郝宣',
      avatarBg: (isSemi ? 'grey' : 'red') as Row['avatarBg'],
    };
  });
</script>

{#snippet nameCell({ value }: { value: unknown; record: Row; index: number })}
  <span style="display:flex;align-items:center;gap:8px">
    <Avatar size="small" shape="square" color="light-blue">S</Avatar>
    {value as string}
  </span>
{/snippet}

{#snippet sizeCell({ value }: { value: unknown; record: Row; index: number })}
  {value as number} KB
{/snippet}

{#snippet ownerCell({ value, record }: { value: unknown; record: Row; index: number })}
  <span style="display:flex;align-items:center;gap:6px">
    <Avatar size="small" color={record.avatarBg}>{(value as string).slice(0, 1)}</Avatar>
    {value as string}
  </span>
{/snippet}

<Table {columns} dataSource={data} rowKey="key" bordered />
