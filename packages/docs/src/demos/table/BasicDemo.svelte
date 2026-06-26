<script lang="ts">
  import { Table, Text } from '@chenzy-design/svelte';

  type TableRow = {
    key: number;
    name: string;
    age: number;
    city: string;
    [k: string]: unknown;
  };

  const tableData: TableRow[] = [
    { key: 1, name: '陈一', age: 32, city: '杭州' },
    { key: 2, name: '林二', age: 28, city: '上海' },
    { key: 3, name: '王三', age: 45, city: '北京' },
    { key: 4, name: '赵四', age: 23, city: '深圳' },
    { key: 5, name: '孙五', age: 38, city: '广州' },
  ];

  const tableColumns = [
    { dataIndex: 'name', title: '姓名', sorter: true },
    { dataIndex: 'age', title: '年龄', sorter: true, align: 'right' as const },
    { dataIndex: 'city', title: '城市' },
  ];

  let tableSelected = $state<(string | number)[]>([]);
  let tableExpandInfo = $state('（未操作）');
  let tableTreeInfo = $state('（未操作）');
  let tableTreeChecked = $state<(string | number)[]>([]);

  const tableTreeData: TableRow[] = [
    {
      key: 1,
      name: '研发中心',
      age: 120,
      city: '杭州',
      children: [
        {
          key: 11,
          name: '前端组',
          age: 40,
          city: '杭州',
          children: [
            { key: 111, name: '陈一', age: 32, city: '杭州' },
            { key: 112, name: '林二', age: 28, city: '杭州' },
          ],
        },
        { key: 12, name: '后端组', age: 80, city: '杭州' },
      ],
    },
    {
      key: 2,
      name: '设计中心',
      age: 35,
      city: '上海',
      children: [{ key: 21, name: '王三', age: 35, city: '上海' }],
    },
    { key: 3, name: '行政', age: 12, city: '北京' },
  ];

  const fixedData = [
    { key: 1, name: '张三', age: 28, city: '北京', email: 'zhang@x.com', phone: '139-0000', action: '编辑' },
    { key: 2, name: '李四', age: 32, city: '上海', email: 'li@x.com', phone: '138-1111', action: '编辑' },
    { key: 3, name: '王五', age: 25, city: '广州', email: 'wang@x.com', phone: '137-2222', action: '编辑' },
  ];

  const tableBigData: TableRow[] = Array.from({ length: 2000 }, (_, i) => ({
    key: i + 1,
    name: `用户 ${i + 1}`,
    age: 18 + (i % 50),
    city: (['杭州', '上海', '北京', '深圳', '广州', '成都'] as const)[i % 6]!,
  }));
</script>

<Text type="tertiary">可排序（姓名/年龄）+ 行选择 + 分页（每页 5）</Text>
<Table
  columns={tableColumns}
  dataSource={tableData}
  rowKey="key"
  bordered
  stripe
  pagination={{ pageSize: 5 }}
  rowSelection={{
    selectedRowKeys: tableSelected,
    onChange: (keys) => (tableSelected = keys),
  }}
/>
<Text type="tertiary">已选 {tableSelected.length} 行</Text>

<Text type="tertiary">行展开（点击 ▶ 展开详情）：</Text>
<div data-testid="table-expand">
  <Table
    columns={tableColumns}
    dataSource={tableData}
    rowKey="key"
    bordered
    expandable={{
      expandedRowRender: tableExpandRow,
      onExpand: (expanded, record) =>
        (tableExpandInfo = `${expanded ? '展开' : '收起'} ${record.name}`),
    }}
  />
</div>
<Text type="tertiary">{tableExpandInfo}</Text>

<Text type="tertiary">固定列（横向滚动，姓名列左固定 / 操作列右固定）：</Text>
<div data-testid="table-fixed" style="max-width:520px">
  <Table
    columns={[
      { dataIndex: 'name', title: '姓名', width: 120, fixed: 'left' },
      { dataIndex: 'age', title: '年龄', width: 200 },
      { dataIndex: 'city', title: '城市', width: 200 },
      { dataIndex: 'email', title: '邮箱', width: 240 },
      { dataIndex: 'phone', title: '电话', width: 200 },
      { dataIndex: 'action', title: '操作', width: 100, fixed: 'right' },
    ]}
    dataSource={fixedData}
    rowKey="key"
    bordered
  />
</div>

<Text type="tertiary">列筛选（城市列漏斗多选）：</Text>
<div data-testid="table-filter">
  <Table
    columns={[
      { dataIndex: 'name', title: '姓名' },
      { dataIndex: 'age', title: '年龄', align: 'right' as const },
      {
        dataIndex: 'city',
        title: '城市',
        filters: [
          { text: '北京', value: '北京' },
          { text: '上海', value: '上海' },
          { text: '广州', value: '广州' },
        ],
      },
    ]}
    dataSource={tableData}
    rowKey="key"
    bordered
  />
</div>

<Text type="tertiary">列宽拖拽（拖动姓名 / 城市列头右侧手柄调整列宽，最小 40px）：</Text>
<div data-testid="table-resizable" style="max-width:560px">
  <Table
    columns={[
      { dataIndex: 'name', title: '姓名', width: 160, resizable: true },
      { dataIndex: 'age', title: '年龄', width: 100, align: 'right' as const },
      { dataIndex: 'city', title: '城市', width: 160, resizable: true },
      { dataIndex: 'email', title: '邮箱', width: 200 },
    ]}
    dataSource={tableData}
    rowKey="key"
    bordered
  />
</div>

<Text type="tertiary">树形数据（行含 children，第一列展开三角 + 缩进；默认展开「研发中心」）：</Text>
<div data-testid="table-tree" style="max-width:520px">
  <Table
    columns={[
      { dataIndex: 'name', title: '部门 / 姓名' },
      { dataIndex: 'age', title: '人数', align: 'right' as const },
      { dataIndex: 'city', title: '城市' },
    ]}
    dataSource={tableTreeData}
    rowKey="key"
    bordered
    tree={{
      defaultExpandedRowKeys: [1],
      onExpand: (expanded, key) =>
        (tableTreeInfo = `${expanded ? '展开' : '收起'} 行 ${key}`),
    }}
  />
</div>
<Text type="tertiary">{tableTreeInfo}</Text>

<Text type="tertiary">树形行选择父子联动：</Text>
<div data-testid="table-tree-checkable" style="max-width:520px">
  <Table
    columns={[
      { dataIndex: 'name', title: '部门 / 姓名' },
      { dataIndex: 'age', title: '人数', align: 'right' as const },
      { dataIndex: 'city', title: '城市' },
    ]}
    dataSource={tableTreeData}
    rowKey="key"
    bordered
    tree={{ defaultExpandedRowKeys: [1, 11] }}
    rowSelection={{
      onChange: (keys) => (tableTreeChecked = keys),
    }}
  />
</div>
<Text type="tertiary">已选 keys：{tableTreeChecked.join(', ') || '（无）'}</Text>

<Text type="tertiary">行虚拟滚动（2000 行，仅渲染视口内 ~十几行）：</Text>
<div data-testid="table-virtualized" style="max-width:520px">
  <Table
    columns={tableColumns}
    dataSource={tableBigData}
    rowKey="key"
    bordered
    virtualized
    height={400}
    rowHeight={48}
  />
</div>

{#snippet tableExpandRow({ record }: { record: TableRow; index: number })}
  <div style="line-height:1.8">
    <strong>{record.name}</strong> 的详细资料：年龄 {record.age}，城市 {record.city}。
  </div>
{/snippet}
