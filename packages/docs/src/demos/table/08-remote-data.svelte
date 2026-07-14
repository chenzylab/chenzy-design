<!-- 拉取远程数据：loading + setTimeout 模拟异步加载，pagination 受控（current 由回调驱动）。对齐 Semi「拉取远程数据」。 -->
<script lang="ts">
  import { Table, Avatar } from '@chenzy-design/svelte';
  import type { Snippet } from 'svelte';

  type Row = {
    key: string;
    name: string;
    size: number;
    owner: string;
    avatarBg: 'grey' | 'red';
    [k: string]: unknown;
  };

  const pageSize = 5;

  function getData(): Row[] {
    return Array.from({ length: 46 }, (_, i) => {
      const isSemi = i % 2 === 0;
      return {
        key: String(i),
        name: isSemi ? `Semi Design 设计稿${i}.fig` : `Semi D2C 设计稿${i}.fig`,
        size: (i * 1000) % 199,
        owner: isSemi ? '姜鹏志' : '郝宣',
        avatarBg: (isSemi ? 'grey' : 'red') as Row['avatarBg'],
      };
    });
  }

  const columns = [
    { dataIndex: 'name', title: '标题', width: 260, render: nameCell as Snippet<[{ value: unknown; record: Row; index: number }]> },
    { dataIndex: 'size', title: '大小', width: 120, align: 'right' as const, render: sizeCell as Snippet<[{ value: unknown; record: Row; index: number }]> },
    { dataIndex: 'owner', title: '所有者', width: 160, render: ownerCell as Snippet<[{ value: unknown; record: Row; index: number }]> },
  ];

  let dataSource = $state<Row[]>([]);
  let loading = $state(false);
  let current = $state(1);

  // 模拟异步：切页时先 loading，300ms 后回填当前页数据。
  // 本库分页对 dataSource 内部切片，故回填全量后仅切换 current 即可。
  function fetchPage(page: number) {
    loading = true;
    current = page;
    setTimeout(() => {
      dataSource = getData();
      loading = false;
    }, 300);
  }

  // 首屏加载
  fetchPage(1);
</script>

{#snippet nameCell({ value }: { value: unknown; record: Row; index: number })}
  <span style="display:flex;align-items:center;gap:8px">
    <Avatar size="small" shape="square" color="light-blue">S</Avatar>
    {value as string}
  </span>
{/snippet}

{#snippet sizeCell({ value }: { value: unknown; record: Row; index: number })}
  {value as number} KB
{/snippet}

{#snippet ownerCell({ value, record }: { value: unknown; record: Row; index: number })}
  <span style="display:flex;align-items:center;gap:6px">
    <Avatar size="small" color={record.avatarBg}>{(value as string).slice(0, 1)}</Avatar>
    {value as string}
  </span>
{/snippet}

<Table
  {columns}
  {dataSource}
  {loading}
  rowKey="key"
  bordered
  pagination={{
    pageSize,
    current,
    onChange: (page) => fetchPage(page),
  }}
/>
