<script lang="ts">
  import { Table, Avatar, Tag } from '@chenzy-design/svelte';
  import { IconTickCircle, IconComment, IconClear } from '@chenzy-design/icons';
  import { figmaIconUrl, getData, formatDate, statusTagConfig, type FileRow } from './_data';

  const pageSize = 5;
  const allData = getData(46);

  let dataSource = $state<FileRow[]>([]);
  let loading = $state(false);
  let currentPage = $state(1);

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
      onFilter: (value: string | number, record: FileRow) =>
        (record.name as string).includes(value as string),
    },
    { title: '大小', dataIndex: 'size', sorter: (a: FileRow, b: FileRow) => ((a.size as number) - (b.size as number) > 0 ? 1 : -1), render: renderSize },
    { title: '交付状态', dataIndex: 'status', render: renderStatus },
    { title: '所有者', dataIndex: 'owner', render: renderOwner },
    { title: '更新日期', dataIndex: 'updateTime', sorter: (a: FileRow, b: FileRow) => ((a.updateTime as number) - (b.updateTime as number) > 0 ? 1 : -1), render: renderDate },
  ];

  const fetchData = (page = 1) => {
    loading = true;
    currentPage = page;
    return new Promise<FileRow[]>((res) => {
      setTimeout(() => {
        res(allData.slice((page - 1) * pageSize, page * pageSize));
      }, 300);
    }).then((rows) => {
      loading = false;
      dataSource = rows;
    });
  };

  // 仅首次挂载拉取一次。
  let inited = false;
  $effect(() => {
    if (inited) return;
    inited = true;
    fetchData();
  });
</script>

{#snippet renderSize({ value }: { value: unknown })}{value} KB{/snippet}
{#snippet renderDate({ value }: { value: unknown })}{formatDate(value)}{/snippet}

{#snippet renderName({ value }: { value: unknown })}
  <div>
    <Avatar size="small" shape="square" src={figmaIconUrl} style="margin-right: 12px" />
    {value}
  </div>
{/snippet}

{#snippet renderStatus({ value }: { value: unknown })}
  {@const cfg = statusTagConfig[value as string] ?? {}}
  {#if cfg.text}
    <Tag shape="circle" color={cfg.color as never} prefixIcon={statusIcon} style="user-select: text">{cfg.text}</Tag>
  {/if}
  {#snippet statusIcon()}
    {#if cfg.icon === 'tick'}<IconTickCircle />{:else if cfg.icon === 'clear'}<IconClear />{:else}<IconComment />{/if}
  {/snippet}
{/snippet}

{#snippet renderOwner({ value, record }: { value: unknown; record: FileRow })}
  <div>
    <Avatar size="small" color={record.avatarBg as never} style="margin-right: 4px">
      {typeof value === 'string' ? value.slice(0, 1) : ''}
    </Avatar>
    {value}
  </div>
{/snippet}

<Table
  {columns}
  {dataSource}
  {loading}
  pagination={{
    currentPage,
    pageSize,
    total: allData.length,
    onPageChange: (page) => fetchData(page),
  }}
/>
