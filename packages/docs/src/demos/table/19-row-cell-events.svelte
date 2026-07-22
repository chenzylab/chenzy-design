<script lang="ts">
  import { Table, Avatar } from '@chenzy-design/svelte';
  import { figmaIconUrl, getData, formatDate, type FileRow } from './_data';

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
    { title: '大小', dataIndex: 'size', sorter: (a: FileRow, b: FileRow) => ((a.size as number) - (b.size as number) > 0 ? 1 : -1), render: renderSize },
    { title: '所有者', dataIndex: 'owner', render: renderOwner },
    { title: '更新日期', dataIndex: 'updateTime', sorter: (a: FileRow, b: FileRow) => ((a.updateTime as number) - (b.updateTime as number) > 0 ? 1 : -1), render: renderDate },
  ];

  const data = getData(46);

  // 表头 tr 定义 onMouseEnter/Leave；行 tr 定义 className；第三行定义 onClick（对齐 Semi）。
  const onRow = (record: FileRow, index: number) => {
    const base = { className: 'my-tr-class' };
    if (index === 2) {
      return { ...base, onClick: () => console.log('mouse click: ', record, index) };
    }
    return base;
  };
  const onHeaderRow = (cols: unknown, index: number) => ({
    onMouseEnter: () => console.log('mouse enter: ', cols, index),
    onMouseLeave: () => console.log('mouse leave: ', cols, index),
  });
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

<Table {columns} dataSource={data} {onRow} {onHeaderRow} />
