<script lang="ts">
  import { Table, Avatar, Input, Button, Space } from '@chenzy-design/svelte';
  import { figmaIconUrl, getData, formatDate, type FileRow } from './_data';
  import type { RenderFilterDropdownProps } from '@chenzy-design/svelte/table';

  const columns = [
    {
      title: '标题',
      dataIndex: 'name',
      width: 400,
      render: renderName,
      onFilter: (value: string | number, record: FileRow) =>
        (record.name as string).includes(value as string),
      renderFilterDropdown: nameFilterDropdown,
    },
    { title: '大小', dataIndex: 'size', sorter: (a: FileRow, b: FileRow) => ((a.size as number) - (b.size as number) > 0 ? 1 : -1), render: renderSize },
    {
      title: '所有者',
      dataIndex: 'owner',
      render: renderOwner,
      onFilter: (value: string | number, record: FileRow) =>
        (record.owner as string).includes(value as string),
      defaultFilteredValue: ['姜鹏志'],
      renderFilterDropdown: ownerFilterDropdown,
    },
    { title: '更新日期', dataIndex: 'updateTime', sorter: (a: FileRow, b: FileRow) => ((a.updateTime as number) - (b.updateTime as number) > 0 ? 1 : -1), render: renderDate },
  ];

  const data = getData(46);
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

{#snippet nameFilterDropdown(props: RenderFilterDropdownProps)}
  {@const { tempFilteredValue, setTempFilteredValue, confirm, clear, close } = props}
  <Space vertical align="start" style="padding: 8px">
    <Input
      value={(tempFilteredValue[0] as string) ?? ''}
      onChange={(v) => setTempFilteredValue(v ? [v] : [])}
    />
    <Space>
      <Button onclick={() => confirm({ closeDropdown: true })}>筛选 + 关闭</Button>
      <Button onclick={() => clear({ closeDropdown: true })}>清除 + 关闭</Button>
      <Button onclick={() => close()}>直接关闭</Button>
    </Space>
  </Space>
{/snippet}

{#snippet ownerFilterDropdown(props: RenderFilterDropdownProps)}
  {@const { tempFilteredValue, setTempFilteredValue, confirm, clear, close } = props}
  <Space vertical align="start" style="padding: 8px">
    <Input
      value={(tempFilteredValue[0] as string) ?? ''}
      onChange={(v) => setTempFilteredValue(v ? [v] : [])}
    />
    <Space>
      <Button onclick={() => confirm({ closeDropdown: false })}>筛选后不关闭</Button>
      <Button onclick={() => clear({ closeDropdown: false })}>清除后不关闭</Button>
      <Button onclick={() => close()}>直接关闭</Button>
    </Space>
  </Space>
{/snippet}

<Table {columns} dataSource={data} />
