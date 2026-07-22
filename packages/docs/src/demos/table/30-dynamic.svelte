<script lang="ts">
  import { Table, Switch, ButtonGroup, Button, Avatar } from '@chenzy-design/svelte';
  import { figmaIconUrl, getData, formatDate, type FileRow } from './_data';
  import type { ColumnDef } from '@chenzy-design/svelte/table';

  // 受控的动态表格：运行时切换固定表头/隐藏表头/标题/底部/固定列/选择列/加载态/
  // 无数据/排序/过滤/行展开/展开所有行/边框/列伸缩，以及分页控件位置（对齐 Semi）。
  const allData = getData(46);

  let fixHeader = $state(false);
  let hideHeader = $state(false);
  let showTitle = $state(false);
  let showFooter = $state(false);
  let fixColumns = $state(false);
  let showSelection = $state(false);
  let loading = $state(false);
  let noData = $state(false);
  let showSorter = $state(false);
  let showFilter = $state(false);
  let expandRow = $state(false);
  let expandAll = $state(false);
  let bordered = $state(false);
  let resizable = $state(false);
  let paginationPosition = $state<'bottom' | 'top' | 'both' | false>('bottom');

  // 固定列开关：对齐 Semi toggleFixColumns（首列 fixed:left、末列 fixed:right、scroll.x）。
  const columns = $derived<ColumnDef<FileRow>[]>([
    {
      title: '标题',
      dataIndex: 'name',
      width: 400,
      fixed: fixColumns ? ('left' as const) : undefined,
      render: renderName,
      ...(showFilter
        ? {
            filters: [
              { text: 'Semi Design 设计稿', value: 'Semi Design 设计稿' },
              { text: 'Semi D2C 设计稿', value: 'Semi D2C 设计稿' },
            ],
            onFilter: (value: string | number, record: FileRow) =>
              (record.name as string).includes(value as string),
          }
        : {}),
    },
    {
      title: '大小',
      dataIndex: 'size',
      width: 200,
      ...(showSorter
        ? { sorter: (a: FileRow, b: FileRow) => ((a.size as number) - (b.size as number) > 0 ? 1 : -1) }
        : {}),
      render: renderSize,
    },
    { title: '所有者', dataIndex: 'owner', width: 200, render: renderOwner },
    {
      title: '更新日期',
      dataIndex: 'updateTime',
      width: 200,
      fixed: fixColumns ? ('right' as const) : undefined,
      ...(showSorter
        ? { sorter: (a: FileRow, b: FileRow) => ((a.updateTime as number) - (b.updateTime as number) > 0 ? 1 : -1) }
        : {}),
      render: renderDate,
    },
  ]);

  const dataSource = $derived(noData ? [] : allData);
  const scroll = $derived({
    ...(fixHeader ? { y: 300 } : {}),
    ...(fixColumns ? { x: 1400 } : {}),
  });
  const rowSelection = $derived(
    showSelection
      ? {
          width: 48,
          fixed: fixColumns,
          onChange: (keys: (string | number)[]) => console.log('selection changed', keys),
        }
      : undefined,
  );
  // 行展开 / 展开当前所有行：对齐 Semi expandedRowRender + expandedRowKeys。
  const expandable = $derived(
    expandRow || expandAll
      ? {
          expandedRowRender: expandedRow,
          expandCellFixed: fixColumns ? ('left' as const) : undefined,
          ...(expandAll ? { expandedRowKeys: dataSource.map((d) => d.key) } : {}),
        }
      : undefined,
  );
  const pagination = $derived(
    paginationPosition === false ? false : { pageSize: 8, position: paginationPosition },
  );
</script>

{#snippet renderSize({ value }: { value: unknown })}{value} KB{/snippet}
{#snippet renderDate({ value }: { value: unknown })}{formatDate(value)}{/snippet}
{#snippet expandedRow({ record }: { record: FileRow })}
  <p style="margin: 0">{record.name}（{record.owner}）的展开内容。</p>
{/snippet}

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

{#snippet toggle(text: string, checked: boolean, onChange: (v: boolean) => void)}
  <span style="display: inline-flex; align-items: center; margin: 5px">
    <span>{text}</span><Switch size="small" {checked} {onChange} />
  </span>
{/snippet}

<div style="margin-bottom: 15px; display: flex; justify-content: space-around; flex-wrap: wrap; align-items: center">
  {@render toggle('固定表头：', fixHeader, (v) => (fixHeader = v))}
  {@render toggle('隐藏表头：', hideHeader, (v) => (hideHeader = v))}
  {@render toggle('显示标题：', showTitle, (v) => (showTitle = v))}
  {@render toggle('显示底部：', showFooter, (v) => (showFooter = v))}
  {@render toggle('固定列：', fixColumns, (v) => (fixColumns = v))}
  {@render toggle('显示选择列：', showSelection, (v) => (showSelection = v))}
  {@render toggle('显示加载状态：', loading, (v) => (loading = v))}
  {@render toggle('无数据：', noData, (v) => (noData = v))}
  {@render toggle('开启排序功能：', showSorter, (v) => (showSorter = v))}
  {@render toggle('开启过滤功能：', showFilter, (v) => (showFilter = v))}
  {@render toggle('开启行展开功能：', expandRow, (v) => (expandRow = v))}
  {@render toggle('展开当前所有行：', expandAll, (v) => (expandAll = v))}
  {@render toggle('显示边框：', bordered, (v) => (bordered = v))}
  {@render toggle('开启列伸缩功能：', resizable, (v) => {
    resizable = v;
    bordered = v;
  })}
  <span style="display: inline-flex; align-items: center; margin: 5px">
    <span>分页控件：</span>
    <ButtonGroup>
      <Button onclick={() => (paginationPosition = 'bottom')}>Bottom</Button>
      <Button onclick={() => (paginationPosition = 'top')}>Top</Button>
      <Button onclick={() => (paginationPosition = 'both')}>Both</Button>
      <Button onclick={() => (paginationPosition = false)}>None</Button>
    </ButtonGroup>
  </span>
</div>
<Table
  {columns}
  {dataSource}
  {rowSelection}
  {scroll}
  {bordered}
  {loading}
  {resizable}
  {expandable}
  {pagination}
  showHeader={!hideHeader}
  title={showTitle ? 'This is title.' : undefined}
  footer={showFooter ? 'This is footer.' : undefined}
/>
