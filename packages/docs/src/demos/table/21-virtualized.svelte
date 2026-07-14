<!-- 虚拟化表格：virtualized + height（视口高）+ rowHeight（行高），仅渲染可见区间，可承载 200+ 行。 -->
<script lang="ts">
  import { Table } from '@chenzy-design/svelte';
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

  const data: Row[] = Array.from({ length: 200 }, (_, i) => {
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
    virtualized
    height={400}
    rowHeight={48}
    scroll={{ x: 710 }}
  />
</div>
