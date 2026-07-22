<script lang="ts">
  import { Table, Avatar, Descriptions, Tag } from '@chenzy-design/svelte';
  import { IconMore } from '@chenzy-design/icons';
  import { figmaIconUrl, docsIconUrl, type FileRow } from './_data';

  const columns = [
    { title: '标题', width: 500, dataIndex: 'name', render: renderName },
    { title: '大小', dataIndex: 'size' },
    { title: '所有者', dataIndex: 'owner', render: renderOwner },
    { title: '更新日期', dataIndex: 'updateTime' },
    { title: '', dataIndex: 'operate', render: renderOperate },
  ];

  const data: FileRow[] = [
    { key: '1', name: 'Semi Design 设计稿.fig', nameIconSrc: figmaIconUrl, size: '2M', owner: '姜鹏志', updateTime: '2020-02-02 05:13', avatarBg: 'grey' },
    { key: '2', name: 'Semi Design 分享演示文稿', nameIconSrc: docsIconUrl, size: '2M', owner: '郝宣', updateTime: '2020-01-17 05:31', avatarBg: 'red' },
    { key: '3', name: '设计文档', nameIconSrc: docsIconUrl, size: '34KB', owner: 'Zoey Edwards', updateTime: '2020-01-26 11:01', avatarBg: 'light-blue' },
  ];

  const expandData: Record<string, { key: string; value: unknown }[]> = {
    'Semi Design 设计稿.fig': [
      { key: '实际用户数量', value: '1,480,000' },
      { key: '7 天留存', value: '98%' },
      { key: '安全等级', value: '3 级' },
      { key: '垂类标签', value: tagDesign },
      { key: '认证状态', value: '未认证' },
    ],
    'Semi Design 分享演示文稿': [
      { key: '实际用户数量', value: '2,480,000' },
      { key: '7 天留存', value: '90%' },
      { key: '安全等级', value: '1 级' },
      { key: '垂类标签', value: tagTemplate },
      { key: '认证状态', value: '已认证' },
    ],
    '设计文档': [
      { key: '实际用户数量', value: '2,920,000' },
      { key: '7 天留存', value: '98%' },
      { key: '安全等级', value: '2 级' },
      { key: '垂类标签', value: tagDoc },
      { key: '认证状态', value: '已认证' },
    ],
  };

  const rowSelection = {
    getCheckboxProps: (record: FileRow) => ({ disabled: record.name === '设计文档' }),
  };
</script>

{#snippet tagDesign()}<Tag style="margin: 0">设计</Tag>{/snippet}
{#snippet tagTemplate()}<Tag style="margin: 0">模板</Tag>{/snippet}
{#snippet tagDoc()}<Tag style="margin: 0">文档</Tag>{/snippet}
{#snippet renderOperate()}<IconMore />{/snippet}

{#snippet renderName({ value, record }: { value: unknown; record: FileRow })}
  <span><Avatar size="small" shape="square" src={record.nameIconSrc} style="margin-right: 12px" />{value}</span>
{/snippet}

{#snippet renderOwner({ value, record }: { value: unknown; record: FileRow })}
  <div>
    <Avatar size="small" color={record.avatarBg as never} style="margin-right: 4px">
      {typeof value === 'string' ? value.slice(0, 1) : ''}
    </Avatar>{value}
  </div>
{/snippet}

{#snippet expandedRowRender({ record }: { record: FileRow })}
  <Descriptions align="justify" data={expandData[record.name] ?? []} />
{/snippet}

<!-- hideExpandedColumn=false 将展开按钮单独作为一列渲染；rowExpandable 关闭某行的可展开按钮 -->
<Table
  rowKey="name"
  {columns}
  dataSource={data}
  expandable={{ expandedRowRender, rowExpandable: (record) => record.name !== '设计文档' }}
  hideExpandedColumn={false}
  {rowSelection}
  pagination={false}
/>
