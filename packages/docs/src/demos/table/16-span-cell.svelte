<script lang="ts">
  import { Table, Avatar } from '@chenzy-design/svelte';
  import { figmaIconUrl, getData, formatDate, type FileRow } from './_data';

  // 行列合并：column.onCell 返回 { colSpan, rowSpan }，值为 0 时该单元格不渲染（对齐 Semi）。
  const columns = [
    {
      title: '标题',
      dataIndex: 'name',
      width: 400,
      render: renderName,
      onCell: (_record: FileRow, index: number) => {
        if (index === 0) return { colSpan: 4 };
        if (index === 1) return { rowSpan: 2 };
        if (index === 2) return { rowSpan: 0 };
        return {};
      },
    },
    {
      title: '大小',
      dataIndex: 'size',
      render: renderSize,
      onCell: (_record: FileRow, index: number) => {
        if (index === 0) return { colSpan: 0 };
        if (index === 1) return { rowSpan: 2 };
        if (index === 2) return { rowSpan: 0 };
        return {};
      },
    },
    {
      title: '所有者',
      dataIndex: 'owner',
      render: renderOwner,
      onCell: (_record: FileRow, index: number) => (index === 0 ? { colSpan: 0 } : {}),
    },
    {
      title: '更新日期',
      dataIndex: 'updateTime',
      sorter: (a: FileRow, b: FileRow) => ((a.updateTime as number) - (b.updateTime as number) > 0 ? 1 : -1),
      render: renderDate,
      onCell: (_record: FileRow, index: number) => {
        if (index === 0) return { colSpan: 0 };
        if (index === 1) return { rowSpan: 2 };
        if (index === 2) return { rowSpan: 0 };
        return {};
      },
    },
  ];

  const data = getData(5);
</script>

{#snippet renderSize({ value }: { value: unknown })}{value} KB{/snippet}
{#snippet renderDate({ value }: { value: unknown })}{formatDate(value)}{/snippet}

{#snippet renderName({ value }: { value: unknown })}
  <div><Avatar size="small" shape="square" src={figmaIconUrl} style="margin-right: 12px" />{value}</div>
{/snippet}

{#snippet renderOwner({ value, record }: { value: unknown; record: FileRow })}
  <div>
    <Avatar size="small" color={record.avatarBg as never} style="margin-right: 4px">
      {typeof value === 'string' ? value.slice(0, 1) : ''}
    </Avatar>{value}
  </div>
{/snippet}

<Table {columns} dataSource={data} pagination={false} />
