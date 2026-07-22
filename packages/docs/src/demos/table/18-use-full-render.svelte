<script lang="ts">
  import { Table, Avatar } from '@chenzy-design/svelte';
  import type { Snippet } from 'svelte';
  import { figmaIconUrl, getData, formatDate, type FileRow } from './_data';

  // useFullRender：开启后 render 额外收到 selection/expandIcon/indentText 物料 Snippet，
  // 由使用方自行摆放（对齐 Semi useFullRender）。title 也可用 Snippet 摆放 sorter/filter/selection。
  const columns = [
    {
      title: nameHeader,
      dataIndex: 'name',
      width: 400,
      filters: [
        { text: 'Semi Design 设计稿', value: 'Semi Design 设计稿' },
        { text: 'Semi D2C 设计稿', value: 'Semi D2C 设计稿' },
      ],
      onFilter: (value: string | number, record: FileRow) => (record.name as string).includes(value as string),
      useFullRender: true,
      render: nameFullRender,
    },
    { title: '大小', dataIndex: 'size', sorter: (a: FileRow, b: FileRow) => ((a.size as number) - (b.size as number) > 0 ? 1 : -1), render: renderSize },
    { title: '所有者', dataIndex: 'owner', render: renderOwner },
    { title: '更新日期', dataIndex: 'updateTime', sorter: (a: FileRow, b: FileRow) => ((a.updateTime as number) - (b.updateTime as number) > 0 ? 1 : -1), render: renderDate },
  ];

  const data = getData(46);

  const rowSelection = { hidden: true, fixed: 'left' as const };
</script>

{#snippet nameHeader({ selection, sorter, filter }: { selection?: Snippet; sorter?: Snippet; filter?: Snippet })}
  <span style="display: inline-flex; align-items: center; padding-left: 20px">
    {#if selection}{@render selection()}{/if}
    <span style="margin-left: 8px">Name</span>
    {#if sorter}{@render sorter()}{/if}
    {#if filter}{@render filter()}{/if}
  </span>
{/snippet}

{#snippet nameFullRender({ value, expandIcon, selection, indentText }: { value: unknown; expandIcon?: Snippet; selection?: Snippet; indentText?: Snippet })}
  <span style="display: inline-flex; align-items: center; justify-content: center">
    {#if indentText}{@render indentText()}{/if}
    {#if expandIcon}{@render expandIcon()}{/if}
    {#if selection}{@render selection()}{/if}
    <span style="margin-left: 8px">
      <Avatar size="small" shape="square" src={figmaIconUrl} style="margin-right: 12px" />
      {value}
    </span>
  </span>
{/snippet}

{#snippet renderSize({ value }: { value: unknown })}{value} KB{/snippet}
{#snippet renderDate({ value }: { value: unknown })}{formatDate(value)}{/snippet}

{#snippet renderOwner({ value, record }: { value: unknown; record: FileRow })}
  <div>
    <Avatar size="small" color={record.avatarBg as never} style="margin-right: 4px">
      {typeof value === 'string' ? value.slice(0, 1) : ''}
    </Avatar>{value}
  </div>
{/snippet}

{#snippet expandedRowRender({ record }: { record: FileRow })}
  <article>{record.name}</article>
{/snippet}

<Table
  pagination={{ pageSize: 12 }}
  {rowSelection}
  {columns}
  dataSource={data}
  expandable={{ expandedRowRender }}
/>
