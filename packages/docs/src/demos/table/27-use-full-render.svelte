<!-- useFullRender：首列开启 useFullRender，render 收到 indentText/expandIcon 物料自行摆放（对齐 Semi） -->
<script lang="ts">
  import { Table, Text } from '@chenzy-design/svelte';
  import type { Snippet } from 'svelte';

  type Row = { key: number; name: string; size: string; children?: Row[]; [k: string]: unknown };

  const data: Row[] = [
    {
      key: 1,
      name: '设计资产',
      size: '—',
      children: [
        { key: 11, name: 'Semi Design 设计稿.fig', size: '2M' },
        { key: 12, name: '组件规范.pdf', size: '1.2M' },
      ],
    },
    {
      key: 2,
      name: '开发文档',
      size: '—',
      children: [{ key: 21, name: 'API 参考.md', size: '48KB' }],
    },
  ];

  const columns = [
    {
      dataIndex: 'name',
      title: '名称',
      useFullRender: true,
      render: nameFull as Snippet<
        [{ value: unknown; record: Row; index: number; indentText?: Snippet; expandIcon?: Snippet }]
      >,
    },
    { dataIndex: 'size', title: '大小', align: 'right' as const },
  ];
</script>

<!-- 完全自定义：indentText（缩进占位）与 expandIcon（展开三角）由使用方决定摆放次序与包装 -->
{#snippet nameFull({ value, indentText, expandIcon }: { value: unknown; record: Row; index: number; indentText?: Snippet; expandIcon?: Snippet })}
  <span style="display:inline-flex;align-items:center">
    {#if indentText}{@render indentText()}{/if}
    {#if expandIcon}{@render expandIcon()}{/if}
    <Text strong>{value as string}</Text>
  </span>
{/snippet}

<Table {columns} dataSource={data} rowKey="key" tree={{ defaultExpandedRowKeys: [1, 2] }} pagination={false} />
