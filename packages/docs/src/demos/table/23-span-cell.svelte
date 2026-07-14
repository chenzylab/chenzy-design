<!-- 行列合并：column.onCell 返回 colSpan/rowSpan，值为 0 的单元格被合并进相邻格（对齐 Semi） -->
<script lang="ts">
  import { Table } from '@chenzy-design/svelte';

  type Row = { key: number; name: string; tel: string; phone: number; home: string; [k: string]: unknown };

  const data: Row[] = [
    { key: 0, name: '李四', tel: '0571-22098909', phone: 18889898989, home: '成都' },
    { key: 1, name: '王五', tel: '0571-22098333', phone: 18889898888, home: '成都' },
    { key: 2, name: '陈二', tel: '0575-22098909', phone: 18900010002, home: '杭州' },
    { key: 3, name: '孙六', tel: '0575-22098909', phone: 18900010002, home: '杭州' },
  ];

  const columns = [
    { title: '姓名', dataIndex: 'name' },
    {
      title: '电话',
      dataIndex: 'tel',
      // 相邻两行电话相同则纵向合并（rowSpan=2 / 0）
      onCell: (_record: Row, index: number) => {
        if (index === 2) return { rowSpan: 2 };
        if (index === 3) return { rowSpan: 0 };
        return {};
      },
    },
    { title: '手机', dataIndex: 'phone' },
    { title: '居住地', dataIndex: 'home' },
  ];
</script>

<Table {columns} dataSource={data} rowKey="key" bordered pagination={false} />
