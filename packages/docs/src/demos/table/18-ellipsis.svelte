<!-- 单元格缩略：column.ellipsis 让超长文本自动省略号截断，配合 width 与横向滚动。 -->
<script lang="ts">
  import { Table } from '@chenzy-design/svelte';

  type Row = {
    key: string;
    name: string;
    owner: string;
    size: string;
    updateTime: string;
    [k: string]: unknown;
  };

  const columns = [
    { dataIndex: 'name', title: '标题', width: 250, fixed: 'left' as const, ellipsis: true },
    { dataIndex: 'owner', title: '所有者', width: 200, ellipsis: true },
    { dataIndex: 'size', title: '大小', width: 120, ellipsis: true },
    { dataIndex: 'updateTime', title: '更新日期', width: 200, ellipsis: true },
  ];

  const data: Row[] = [
    {
      key: '1',
      name: 'Semi is designed based on FA architecture, and the main logic is extracted as Foundation package',
      owner: 'Pengzhi Jiang Pengzhi Jiang Pengzhi Jiang',
      size: '2M',
      updateTime: '2020-02-02 05:13',
    },
    {
      key: '2',
      name: '由抖音前端与 UED 团队维护，易于定制的现代化设计系统，帮助设计师与开发者打造高质量产品。',
      owner: '郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣',
      size: '2M',
      updateTime: '2020-02-02 05:13',
    },
    {
      key: '3',
      name: 'Semi is designed based on FA architecture, easy to migrate to other frameworks',
      owner: 'Pengzhi Jiang',
      size: '34KB',
      updateTime: '2020-02-02 05:13',
    },
    {
      key: '4',
      name: '易于定制的现代化设计系统，帮助设计师与开发者打造高质量产品。',
      owner: '郝宣',
      size: '34KB',
      updateTime: '2020-02-02 05:13',
    },
  ];
</script>

<Table {columns} dataSource={data} rowKey="key" bordered scroll={{ x: 770 }} />
