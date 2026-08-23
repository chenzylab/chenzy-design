<script lang="ts">
  import { Skeleton, SkeletonTitle, SkeletonParagraph, Table } from '@chenzy-design/svelte';

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

  // 骨架表格：表头/单元格均用骨架块拼出（对齐 Semi，非真实表格套 render）
  const skColumns = [1, 2, 3].map((key) => ({
    dataIndex: `${key}`,
    title: skTitle,
  }));
  const skData: SkRow[] = [1, 2, 3, 4].map((key) => {
    const row: SkRow = { key: `${key}` };
    [1, 2, 3].forEach((i) => {
      row[i] = 50 * i;
    });
    return row;
  });
</script>

{#snippet skTitle()}
  <SkeletonTitle style="width:0" />
{/snippet}

{#snippet skCell({ value }: { value: unknown; record: SkRow; index: number })}
  <SkeletonParagraph style="width:{value}px" rows={1} />
{/snippet}

<Skeleton loading active>
  {#snippet placeholder()}
    <div style="position:relative">
      <Table
        style="background-color: var(--cd-color-bg-1)"
        columns={skColumns.map((c) => ({ ...c, render: skCell }))}
        dataSource={skData}
        pagination={false}
      />
      <div style="position:absolute; left:0; right:0; top:0; bottom:0"></div>
    </div>
  {/snippet}
  <div>
    <Table {columns} dataSource={dataSource} pagination={false} />
  </div>
</Skeleton>
