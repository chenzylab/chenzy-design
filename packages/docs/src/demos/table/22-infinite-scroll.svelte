<!-- 无限滚动：onReachBottom 在滚动触底时追加数据并显示 loading（本库以 onReachBottom 替代 Semi 的 virtualized.onScroll）。 -->
<script lang="ts">
  import { Table, Spin } from '@chenzy-design/svelte';
  import type { Snippet } from 'svelte';

  type Row = { key: string; name: string; size: number; owner: string; updateTime: string; [k: string]: unknown };

  const columns = [
    { dataIndex: 'name', title: '标题', width: 240, fixed: 'left' as const },
    {
      dataIndex: 'size',
      title: '大小',
      width: 150,
      render: sizeCell as Snippet<[{ value: unknown; record: Row; index: number }]>,
    },
    { dataIndex: 'owner', title: '所有者', width: 160 },
    { dataIndex: 'updateTime', title: '更新日期', width: 160, fixed: 'right' as const },
  ];

  const PAGE_SIZE = 20;

  function makeRows(start: number, count: number): Row[] {
    return Array.from({ length: count }, (_, k) => {
      const i = start + k;
      const isSemiDesign = i % 2 === 0;
      const randomNumber = (i * 1000) % 199;
      return {
        key: String(i),
        name: isSemiDesign ? `Semi Design 设计稿${i}.fig` : `Semi D2C 设计稿${i}.fig`,
        owner: isSemiDesign ? '姜鹏志' : '郝宣',
        size: randomNumber,
        updateTime: `2022-01-${String((i % 28) + 1).padStart(2, '0')}`,
      };
    });
  }

  let data = $state<Row[]>(makeRows(0, PAGE_SIZE));
  let loading = $state(false);

  function loadMore() {
    if (loading) return;
    loading = true;
    // 模拟异步请求：真实场景此处替换为接口调用
    setTimeout(() => {
      data = [...data, ...makeRows(data.length, PAGE_SIZE)];
      loading = false;
    }, 600);
  }
</script>

{#snippet sizeCell({ value }: { value: unknown; record: Row; index: number })}
  {value} KB
{/snippet}

<div style="width:710px">
  <Table
    {columns}
    dataSource={data}
    rowKey="key"
    bordered
    height={400}
    onReachBottom={loadMore}
    scroll={{ x: 710 }}
  />
  {#if loading}
    <div style="display:flex;justify-content:center;padding:12px">
      <Spin />
    </div>
  {/if}
</div>
