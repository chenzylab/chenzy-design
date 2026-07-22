<script lang="ts">
  import { Table, Avatar } from '@chenzy-design/svelte';
  import { IconMore } from '@chenzy-design/icons';
  import { figmaIconUrl, getData, formatDate, type FileRow } from './_data';

  const columns = [
    {
      title: '标题',
      dataIndex: 'name',
      fixed: 'left' as const,
      width: 250,
      render: renderName,
      filters: [
        { text: 'Semi Design 设计稿', value: 'Semi Design 设计稿' },
        { text: 'Semi D2C 设计稿', value: 'Semi D2C 设计稿' },
      ],
      onFilter: (value: string | number, record: FileRow) =>
        (record.name as string).includes(value as string),
    },
    { title: '大小', dataIndex: 'size', width: 200, sorter: (a: FileRow, b: FileRow) => ((a.size as number) - (b.size as number) > 0 ? 1 : -1), render: renderSize },
    { title: '所有者', dataIndex: 'owner', width: 200, render: renderOwner },
    { title: '更新日期', dataIndex: 'updateTime', width: 200, sorter: (a: FileRow, b: FileRow) => ((a.updateTime as number) - (b.updateTime as number) > 0 ? 1 : -1), render: renderDate },
    { title: '', dataIndex: 'operate', fixed: 'right' as const, align: 'center' as const, width: 100, render: renderOperate },
  ];

  const data = getData(46).map(({ status, ...rest }) => rest);

  const rowSelection = { fixed: true as const };
</script>

{#snippet renderSize({ value }: { value: unknown })}{value} KB{/snippet}
{#snippet renderDate({ value }: { value: unknown })}{formatDate(value)}{/snippet}
{#snippet renderOperate()}<IconMore />{/snippet}

{#snippet renderName({ value }: { value: unknown })}
  <div>
    <Avatar size="small" shape="square" src={figmaIconUrl} style="margin-right: 12px" />
    {value}
  </div>
{/snippet}

{#snippet renderOwner({ value, record }: { value: unknown; record: FileRow })}
  <div>
    <Avatar size="small" color={record.avatarBg as never} style="margin-right: 4px">
      {typeof value === 'string' ? value.slice(0, 1) : ''}
    </Avatar>
    {value}
  </div>
{/snippet}

<Table {columns} dataSource={data} {rowSelection} scroll={{ y: 300, x: 1200 }} />
