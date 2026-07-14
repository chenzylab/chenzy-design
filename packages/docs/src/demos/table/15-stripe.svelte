<!-- 实现斑马纹样式：用 onRow 给偶数行返回 style 背景色，隔行变色（对齐 Semi onRow 方案） -->
<script lang="ts">
  import { Table } from '@chenzy-design/svelte';

  type Row = {
    key: string;
    name: string;
    size: string;
    owner: string;
    updateTime: string;
    [k: string]: unknown;
  };

  const columns = [
    { dataIndex: 'name', title: '标题', width: 240 },
    { dataIndex: 'size', title: '大小' },
    { dataIndex: 'owner', title: '所有者' },
    { dataIndex: 'updateTime', title: '更新日期' },
  ];

  const data: Row[] = [
    { key: '1', name: 'Semi Design 设计稿.fig', size: '2M', owner: '姜鹏志', updateTime: '2020-02-02 05:13' },
    { key: '2', name: 'Semi Design 分享演示文稿', size: '2M', owner: '郝宣', updateTime: '2020-01-17 05:31' },
    { key: '3', name: '设计文档', size: '34KB', owner: 'Zoey Edwards', updateTime: '2020-01-26 11:01' },
    { key: '4', name: 'Semi D2C 设计稿.fig', size: '2M', owner: '姜鹏志', updateTime: '2020-02-02 05:13' },
    { key: '5', name: 'Semi D2C 分享演示文稿', size: '2M', owner: '郝宣', updateTime: '2020-01-17 05:31' },
    { key: '6', name: 'Semi D2C 设计文档', size: '34KB', owner: 'Zoey Edwards', updateTime: '2020-01-26 11:01' },
  ];

  // 偶数行（index 从 0 起）填充底色，实现斑马纹
  const onRow = (_record: Row, index: number) =>
    index % 2 === 0 ? { style: 'background:var(--cd-color-fill-0)' } : {};
</script>

<Table {columns} dataSource={data} rowKey="key" bordered {onRow} pagination={false} />
