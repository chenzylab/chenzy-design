<script lang="ts">
  import { Table, Switch, Avatar } from '@chenzy-design/svelte';
  import { figmaIconUrl, getData, formatDate, type FileRow } from './_data';

  // 受控动态表格：运行时切换固定表头/边框/行选择/加载态等（对齐 Semi 动态表格）。
  let fixHeader = $state(false);
  let bordered = $state(false);
  let showSelection = $state(false);
  let loading = $state(false);

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

  const rowSelection = $derived(
    showSelection
      ? { onChange: (keys: (string | number)[]) => console.log('selection changed', keys) }
      : undefined,
  );
  const scroll = $derived(fixHeader ? { y: 300 } : {});
</script>

{#snippet renderSize({ value }: { value: unknown })}{value} KB{/snippet}
{#snippet renderDate({ value }: { value: unknown })}{formatDate(value)}{/snippet}

{#snippet renderName({ value }: { value: unknown })}
  <span><Avatar size="small" shape="square" src={figmaIconUrl} style="margin-right: 12px" />{value}</span>
{/snippet}

{#snippet renderOwner({ value, record }: { value: unknown; record: FileRow })}
  <div>
    <Avatar size="small" color={record.avatarBg as never} style="margin-right: 4px">
      {typeof value === 'string' ? value.slice(0, 1) : ''}
    </Avatar>{value}
  </div>
{/snippet}

<div style="margin-bottom: 15px; display: flex; justify-content: space-around; flex-wrap: wrap">
  <span style="display: inline-flex; align-items: center; margin: 5px">
    <span>固定表头：</span><Switch size="small" checked={fixHeader} onChange={(v) => (fixHeader = v)} />
  </span>
  <span style="display: inline-flex; align-items: center; margin: 5px">
    <span>显示边框：</span><Switch size="small" checked={bordered} onChange={(v) => (bordered = v)} />
  </span>
  <span style="display: inline-flex; align-items: center; margin: 5px">
    <span>显示选择列：</span><Switch size="small" checked={showSelection} onChange={(v) => (showSelection = v)} />
  </span>
  <span style="display: inline-flex; align-items: center; margin: 5px">
    <span>显示加载状态：</span><Switch size="small" checked={loading} onChange={(v) => (loading = v)} />
  </span>
</div>
<Table {columns} dataSource={data} {rowSelection} {scroll} {bordered} {loading} pagination={{ pageSize: 8 }} />
