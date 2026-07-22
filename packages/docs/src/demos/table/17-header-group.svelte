<script lang="ts">
  import { Table, Avatar } from '@chenzy-design/svelte';
  import { IconMore } from '@chenzy-design/icons';
  import { figmaIconUrl, getData, formatDate, type FileRow } from './_data';

  // 表头合并：column.children 定义子列，父列 title 横跨其全部叶子列（对齐 Semi 配置式写法）。
  const columns = [
    {
      title: '基本信息',
      fixed: 'left' as const,
      children: [
        {
          title: '标题',
          dataIndex: 'name',
          width: 300,
          fixed: true,
          render: renderName,
          filters: [
            { text: 'Semi Design 设计稿', value: 'Semi Design 设计稿' },
            { text: 'Semi D2C 设计稿', value: 'Semi D2C 设计稿' },
          ],
          onFilter: (value: string | number, record: FileRow) => (record.name as string).includes(value as string),
        },
        {
          title: '大小',
          dataIndex: 'size',
          width: 100,
          fixed: true,
          sorter: (a: FileRow, b: FileRow) => ((a.size as number) - (b.size as number) > 0 ? 1 : -1),
          render: renderSize,
        },
      ],
    },
    {
      title: '其他信息',
      children: [
        { title: '所有者', dataIndex: 'owner', render: renderOwner },
        {
          title: '更新日期',
          dataIndex: 'updateTime',
          sorter: (a: FileRow, b: FileRow) => ((a.updateTime as number) - (b.updateTime as number) > 0 ? 1 : -1),
          render: renderDate,
        },
      ],
    },
    {
      title: '更多',
      fixed: 'right' as const,
      width: 100,
      align: 'center' as const,
      dataIndex: 'operate',
      render: renderOperate,
    },
  ];

  const data = getData(46);
</script>

{#snippet renderSize({ value }: { value: unknown })}{value} KB{/snippet}
{#snippet renderDate({ value }: { value: unknown })}{formatDate(value)}{/snippet}
{#snippet renderOperate()}<IconMore />{/snippet}

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

{#snippet expandedRowRender({ record }: { record: FileRow })}
  <article>{record.name}</article>
{/snippet}

<Table
  rowSelection={{ fixed: true }}
  expandable={{ expandedRowRender }}
  dataSource={data}
  scroll={{ y: 400 }}
  {columns}
/>
