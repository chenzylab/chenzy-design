<script lang="ts">
  import { Table, Column, Avatar } from '@chenzy-design/svelte';
  import { IconMore } from '@chenzy-design/icons';
  import { figmaIconUrl, getData, formatDate, type FileRow } from './_data';

  // 组合式列写法（对齐 Semi Table.Column）：用 <Column> 子组件声明列，嵌套 <Column>
  // 即表头合并。与配置式 columns 等价，二选一。
  const data = getData(46);
  const nameFilters = [
    { text: 'Semi Design 设计稿', value: 'Semi Design 设计稿' },
    { text: 'Semi D2C 设计稿', value: 'Semi D2C 设计稿' },
  ];
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
>
  <Column title="基本信息" fixed="left">
    <Column
      title="标题"
      dataIndex="name"
      width={300}
      fixed
      render={renderName}
      filters={nameFilters}
      onFilter={(value, record) => (record.name as string).includes(value as string)}
    />
    <Column
      title="大小"
      dataIndex="size"
      width={100}
      fixed
      sorter={(a, b) => ((a.size as number) - (b.size as number) > 0 ? 1 : -1)}
      render={renderSize}
    />
  </Column>
  <Column title="其他信息">
    <Column title="所有者" dataIndex="owner" render={renderOwner} />
    <Column
      title="更新日期"
      dataIndex="updateTime"
      sorter={(a, b) => ((a.updateTime as number) - (b.updateTime as number) > 0 ? 1 : -1)}
      render={renderDate}
    />
  </Column>
  <Column
    title="更多"
    dataIndex="operate"
    fixed="right"
    width={100}
    align="center"
    render={renderOperate}
  />
</Table>
