<script lang="ts">
  import { Table, Avatar } from '@chenzy-design/svelte';
  import { figmaIconUrl, DAY, formatDate, type FileRow } from './_data';

  const columns = [
    {
      title: '标题',
      dataIndex: 'name',
      width: 300,
      render: renderName,
      filters: [
        { text: 'Semi Design 设计稿', value: 'Semi Design' },
        { text: 'Semi Pro 设计稿', value: 'Semi Pro' },
      ],
      onFilter: (value: string | number, record: FileRow) => (record.name as string).includes(value as string),
      filterMultiple: true,
      filterConfirmMode: 'confirm' as const,
    },
    { title: '大小', dataIndex: 'size', sorter: (a: FileRow, b: FileRow) => ((a.size as number) - (b.size as number) > 0 ? 1 : -1), render: renderSize },
    {
      title: '所有者',
      dataIndex: 'owner',
      filters: [
        { text: '姜鹏志', value: '姜鹏志' },
        { text: '郝宣', value: '郝宣' },
      ],
      onFilter: (value: string | number, record: FileRow) => (record.owner as string).includes(value as string),
      filterMultiple: true,
      filterConfirmMode: 'confirm' as const,
      render: renderOwner,
    },
    { title: '更新日期', dataIndex: 'updateTime', sorter: (a: FileRow, b: FileRow) => ((a.updateTime as number) - (b.updateTime as number) > 0 ? 1 : -1), render: renderDate },
  ];

  const getData = (): FileRow[] => {
    const rows: FileRow[] = [];
    for (let i = 0; i < 20; i++) {
      const isSemiDesign = i % 2 === 0;
      const randomNumber = (i * 1000) % 199;
      rows.push({
        key: '' + i,
        name: isSemiDesign ? `Semi Design 设计稿${i}.fig` : `Semi Pro 首页${i}.fig`,
        owner: isSemiDesign ? '姜鹏志' : '郝宣',
        size: randomNumber,
        updateTime: new Date('2024-01-25').valueOf() + randomNumber * DAY,
        avatarBg: isSemiDesign ? 'grey' : 'red',
      });
    }
    return rows;
  };
  const data = getData();
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

<Table {columns} dataSource={data} />
