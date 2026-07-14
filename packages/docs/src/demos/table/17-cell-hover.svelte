<!-- 实现单元格 Hover 样式定制：默认整行 hover，用 CSS 覆盖为单个单元格高亮 -->
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
  ];
</script>

<div class="cell-hover-custom">
  <Table {columns} dataSource={data} rowKey="key" bordered pagination={false} />
</div>

<style>
  /* 移除整行 hover 底色，改为悬停的单个单元格高亮 */
  .cell-hover-custom :global(.cd-table-tbody > .cd-table-row:hover > .cd-table-row-cell) {
    background-color: transparent;
    background-image: none;
  }
  .cell-hover-custom :global(.cd-table-tbody > .cd-table-row > .cd-table-row-cell:hover) {
    background-color: var(--cd-color-primary-light-default);
  }
</style>
