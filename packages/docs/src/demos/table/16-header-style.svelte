<!-- 实现表头样式定制：headerStyle 传对象（背景色 + 加粗），统一改整表表头样式 -->
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
    { dataIndex: 'size', title: '大小', width: 100 },
    { dataIndex: 'owner', title: '所有者', width: 160 },
    { dataIndex: 'updateTime', title: '更新日期' },
  ];

  const data: Row[] = [
    { key: '1', name: 'Semi Design 设计稿.fig', size: '2M', owner: '姜鹏志', updateTime: '2020-02-02 05:13' },
    { key: '2', name: 'Semi Design 分享演示文稿', size: '2M', owner: '郝宣', updateTime: '2020-01-17 05:31' },
    { key: '3', name: '设计文档', size: '34KB', owner: 'Zoey Edwards', updateTime: '2020-01-26 11:01' },
    { key: '4', name: 'Semi D2C 设计稿.fig', size: '2M', owner: '姜鹏志', updateTime: '2020-02-02 05:13' },
  ];

  // headerStyle 支持对象；键为 kebab-case CSS 属性，序列化后作用于表头行
  const headerStyle = {
    'background-color': 'var(--cd-color-fill-0)',
    'font-weight': '600',
  };
</script>

<Table {columns} dataSource={data} rowKey="key" bordered {headerStyle} pagination={false} />
