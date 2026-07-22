<script lang="ts">
  import { Table, Avatar } from '@chenzy-design/svelte';
  import { getData, figmaIconUrl, formatDate, type FileRow } from './_data';
  import type { ColumnDef } from '@chenzy-design/svelte/table';

  const columns = [
    {
      title: '标题',
      dataIndex: 'name',
      width: 400,
      render: renderName,
      filters: [
        { text: 'Semi Design 设计稿', value: 'Semi Design 设计稿' },
        { text: 'Semi D2C 设计稿', value: 'Semi D2C 设计稿' },
      ],
      onFilter: (value: string | number, record: FileRow) => (record.name as string).includes(value as string),
    },
    { title: '大小', dataIndex: 'size', width: 200, sorter: (a: FileRow, b: FileRow) => ((a.size as number) - (b.size as number) > 0 ? 1 : -1), render: renderSize },
    { title: '所有者', width: 200, dataIndex: 'owner', render: renderOwner },
    { title: '更新日期', dataIndex: 'updateTime', sorter: (a: FileRow, b: FileRow) => ((a.updateTime as number) - (b.updateTime as number) > 0 ? 1 : -1), render: renderDate },
  ];

  const data = getData(46);

  // resizable 对象态：onResizeStart/onResizeStop 返回 className 与列合并，拖拽时加竖线效果（对齐 Semi）。
  const resizable = {
    onResizeStart: (col: ColumnDef<FileRow>) => ({ className: `${col.className ?? ''} my-resizing`.trim() }),
    onResizeStop: (col: ColumnDef<FileRow>) => ({ className: (col.className ?? '').replace('my-resizing', '').trim() }),
  };
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

<div id="components-table-demo-resizable-column">
  <Table {columns} dataSource={data} {resizable} pagination={{ pageSize: 5 }} bordered />
</div>

<style>
  #components-table-demo-resizable-column :global(.my-resizing) {
    border-right: 2px solid red;
  }
  #components-table-demo-resizable-column :global(.react-resizable-handle:hover) {
    background-color: red;
  }
</style>
