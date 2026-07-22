<script lang="ts">
  import { Table, Avatar, Button } from '@chenzy-design/svelte';
  import { DAY, formatDate, type FileRow } from './_data';

  const columns = [
    {
      title: '标题',
      dataIndex: 'name',
      width: 200,
      fixed: true,
      render: renderName,
      filters: [
        { text: 'Semi Design 设计稿', value: 'Semi Design 设计稿' },
        { text: 'Semi D2C 设计稿', value: 'Semi D2C 设计稿' },
      ],
      onFilter: (value: string | number, record: FileRow) => (record.name as string).includes(value as string),
    },
    { title: '大小', dataIndex: 'size', width: 150, sorter: (a: FileRow, b: FileRow) => ((a.size as number) - (b.size as number) > 0 ? 1 : -1), render: renderSize },
    { title: '所有者', dataIndex: 'owner', render: renderOwner },
    { title: '更新日期', dataIndex: 'updateTime', fixed: 'right' as const, width: 150, sorter: (a: FileRow, b: FileRow) => ((a.updateTime as number) - (b.updateTime as number) > 0 ? 1 : -1), render: renderDate },
  ];

  const getData = (): FileRow[] => {
    const rows: FileRow[] = [];
    for (let i = 0; i < 1000; i++) {
      const isSemiDesign = i % 2 === 0;
      const randomNumber = (i * 1000) % 199;
      rows.push({
        key: '' + i,
        name: isSemiDesign ? `Semi Design 设计稿${i}.fig` : `Semi D2C 设计稿${i}.fig`,
        owner: isSemiDesign ? '姜鹏志' : '郝宣',
        size: randomNumber,
        updateTime: Date.now() + randomNumber * DAY,
        avatarBg: isSemiDesign ? 'grey' : 'red',
      });
    }
    return rows;
  };
  const data = getData();

  let listRef: { scrollTo: (o: number) => void; scrollToItem: (i: number) => void } | undefined;
</script>

{#snippet renderSize({ value }: { value: unknown })}{value} KB{/snippet}
{#snippet renderDate({ value }: { value: unknown })}{formatDate(value)}{/snippet}

{#snippet renderName({ value }: { value: unknown })}<div>{value}</div>{/snippet}

{#snippet renderOwner({ value, record }: { value: unknown; record: FileRow })}
  <div>
    <Avatar size="small" color={record.avatarBg as never} style="margin-right: 4px">
      {typeof value === 'string' ? value.slice(0, 1) : ''}
    </Avatar>{value}
  </div>
{/snippet}

<Button onclick={() => listRef?.scrollToItem(100)}>Scroll to 100</Button>
<Table
  pagination={false}
  {columns}
  dataSource={data}
  scroll={{ y: 400, x: 900 }}
  style="width: 750px; margin: 0 auto"
  virtualized
  height={400}
  rowHeight={56}
  getVirtualizedListRef={(ref) => (listRef = ref)}
/>
