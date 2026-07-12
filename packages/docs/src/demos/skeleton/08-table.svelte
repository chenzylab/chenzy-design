<script lang="ts">
  import { Skeleton, SkeletonParagraph, Table } from '@chenzy-design/svelte';

  type Row = {
    key: string;
    name: string;
    age: number;
    address: string;
    [k: string]: unknown;
  };

  const columns = [
    { dataIndex: 'name', title: 'Name' },
    { dataIndex: 'age', title: 'Age' },
    { dataIndex: 'address', title: 'Address' },
  ];

  const dataSource: Row[] = [
    { key: '1', name: 'John Brown', age: 32, address: 'New York No. 1 Lake Park' },
    { key: '2', name: 'Jim Green', age: 42, address: 'London No. 1 Lake Park' },
    { key: '3', name: 'Joe Black', age: 32, address: 'Sidney No. 1 Lake Park' },
    { key: '4', name: 'Disabled User', age: 99, address: 'Sidney No. 1 Lake Park' },
  ];

  type SkRow = { key: string; [k: string]: unknown };

  // 占位表格：每个单元格用骨架段落填充
  const skColumns = [
    { dataIndex: 'c1', title: 'Name', render: cell },
    { dataIndex: 'c2', title: 'Age', render: cell },
    { dataIndex: 'c3', title: 'Address', render: cell },
  ];
  const skData: SkRow[] = [{ key: '1' }, { key: '2' }, { key: '3' }, { key: '4' }];
</script>

{#snippet cell(_ctx: { value: unknown; record: SkRow; index: number })}
  <SkeletonParagraph rows={1} style="width:120px" />
{/snippet}

<Skeleton loading active>
  {#snippet placeholder()}
    <Table columns={skColumns} dataSource={skData} pagination={false} />
  {/snippet}
  <Table {columns} {dataSource} pagination={false} />
</Skeleton>
