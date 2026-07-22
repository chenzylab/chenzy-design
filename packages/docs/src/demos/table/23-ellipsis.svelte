<script lang="ts">
  import { Table } from '@chenzy-design/svelte';
  import { IconMore } from '@chenzy-design/icons';
  import { figmaIconUrl, docsIconUrl, type FileRow } from './_data';

  // column.ellipsis 开启单元格自动缩略（对齐 Semi v2.34），带原生 title 提示。
  const columns = [
    {
      title: '标题',
      dataIndex: 'name',
      fixed: true,
      width: 250,
      filters: [
        { text: 'Semi Design 设计稿', value: 'Semi Design 设计稿' },
        { text: 'Semi D2C 设计稿', value: 'Semi D2C 设计稿' },
      ],
      onFilter: (value: string | number, record: FileRow) => (record.name as string).includes(value as string),
      sorter: (a: FileRow, b: FileRow) => ((a.name as string).length - (b.name as string).length > 0 ? 1 : -1),
      ellipsis: true,
    },
    {
      title: '所有者',
      dataIndex: 'owner',
      width: 200,
      ellipsis: true,
      filters: [
        { text: 'Semi Design 设计稿', value: 'Semi Design 设计稿' },
        { text: 'Semi D2C 设计稿', value: 'Semi D2C 设计稿' },
      ],
      onFilter: (value: string | number, record: FileRow) => (record.name as string).includes(value as string),
      sorter: (a: FileRow, b: FileRow) => ((a.name as string).length - (b.name as string).length > 0 ? 1 : -1),
    },
    { title: '大小', dataIndex: 'size', sorter: (a: FileRow, b: FileRow) => ((a.name as string).length - (b.name as string).length > 0 ? 1 : -1), ellipsis: true },
    { title: '更新日期', dataIndex: 'updateTime', width: 200, ellipsis: true },
    { title: '', dataIndex: 'operate', fixed: 'right' as const, align: 'center' as const, width: 100, render: renderOperate },
  ];

  const data: FileRow[] = [
    { key: '1', name: 'Semi is designed based on FA architecture, and the main logic is extracted as Foundation package, which is easy to migrate to other frameworks', nameIconSrc: figmaIconUrl, size: '2M', owner: 'Pengzhi Jiang Pengzhi Jiang Pengzhi Jiang Pengzhi Jiang', updateTime: '2020-02-02 05:13', avatarBg: 'grey' },
    { key: '2', name: '由抖音前端与 UED 团队维护，易于定制的现代化设计系统，帮助设计师与开发者打造高质量产品。由抖音前端与 UED 团队维护，易于定制的现代化设计系统，帮助设计师与开发者打造高质量产品。', nameIconSrc: docsIconUrl, size: '2M', owner: '郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣', updateTime: '2020-02-02 05:13', avatarBg: 'red' },
    { key: '3', name: 'Semi is designed based on FA architecture, and the main logic is extracted as Foundation package, which is easy to migrate to other frameworks', nameIconSrc: docsIconUrl, size: '34KB', owner: 'Pengzhi Jiang Pengzhi Jiang Pengzhi Jiang Pengzhi Jiang', updateTime: '2020-02-02 05:13', avatarBg: 'light-blue' },
    { key: '4', name: '由抖音前端与 UED 团队维护，易于定制的现代化设计系统，帮助设计师与开发者打造高质量产品。由抖音前端与 UED 团队维护，易于定制的现代化设计系统，帮助设计师与开发者打造高质量产品。', nameIconSrc: docsIconUrl, size: '34KB', owner: '郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣郝宣', updateTime: '2020-02-02 05:13', avatarBg: 'light-blue' },
  ];
</script>

{#snippet renderOperate()}<IconMore />{/snippet}

<Table scroll={{ x: 1200 }} {columns} dataSource={data} pagination={false} />
