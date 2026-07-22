<!-- 组合式 <Column> 测试夹具：嵌套表头合并 + 叶子列，验证收集等价配置式。 -->
<script lang="ts">
  import Table from './Table.svelte';
  import Column from './Column.svelte';

  interface Row {
    key: string;
    name: string;
    size: number;
    owner: string;
    [k: string]: unknown;
  }

  let { dataSource = [], includeExtra = false }: { dataSource?: Row[]; includeExtra?: boolean } =
    $props();
</script>

{#snippet nameCell({ value }: { value: unknown })}<span>{value}</span>{/snippet}

<Table {dataSource}>
  <Column title="基本信息">
    <Column title="标题" dataIndex="name" width={200} render={nameCell} />
    <Column
      title="大小"
      dataIndex="size"
      width={100}
      sorter={(a: Row, b: Row) => a.size - b.size}
    />
  </Column>
  <Column title="其他信息">
    <Column title="所有者" dataIndex="owner" />
    {#if includeExtra}
      <Column title="额外" dataIndex="key" />
    {/if}
  </Column>
</Table>
