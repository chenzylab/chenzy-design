<script lang="ts">
  import { Table, Text } from '@chenzy-design/svelte';

  type Row = { key: number; name: string; dept: string; age: number; [k: string]: unknown };

  const columns = [
    { dataIndex: 'name', title: '姓名' },
    { dataIndex: 'age', title: '年龄', align: 'right' as const },
  ];

  const data: Row[] = [
    { key: 1, name: '陈一', dept: '研发', age: 32 },
    { key: 2, name: '林二', dept: '研发', age: 28 },
    { key: 3, name: '王三', dept: '设计', age: 45 },
    { key: 4, name: '赵四', dept: '设计', age: 23 },
    { key: 5, name: '孙五', dept: '运营', age: 38 },
  ];
</script>

<Table
  {columns}
  dataSource={data}
  rowKey="key"
  bordered
  groupBy="dept"
  clickGroupedRowToExpand
  defaultExpandAllGroupRows={false}
/>
<Text type="tertiary">点击分组标题行可折叠/展开该组（默认全部折叠）。</Text>
