<script lang="ts">
  import { Table, Avatar } from '@chenzy-design/svelte';
  import { IconMore } from '@chenzy-design/icons';
  import { figmaIconUrl, docsIconUrl, type FileRow } from './_data';

  // 通过 Column.onHeaderCell 返回 style/className 定制表头样式（对齐 Semi）。
  const onHeaderCell = () => ({ style: 'background-color: var(--cd-color-fill-0)' });

  const columns = [
    { title: '标题', dataIndex: 'name', width: 280, render: renderName, onHeaderCell },
    { title: '大小', width: 100, dataIndex: 'size', onHeaderCell },
    { title: '所有者', dataIndex: 'owner', width: 200, render: renderOwner, onHeaderCell },
    { title: '更新日期', width: 300, dataIndex: 'updateTime', onHeaderCell },
    { title: '', dataIndex: 'operate', render: renderOperate, onHeaderCell },
  ];

  const data: FileRow[] = [
    { key: '1', name: 'Semi Design 设计稿.fig', nameIconSrc: figmaIconUrl, size: '2M', owner: '姜鹏志', updateTime: '2020-02-02 05:13', avatarBg: 'grey' },
    { key: '2', name: 'Semi Design 分享演示文稿', nameIconSrc: docsIconUrl, size: '2M', owner: '郝宣', updateTime: '2020-01-17 05:31', avatarBg: 'red' },
    { key: '3', name: '设计文档', nameIconSrc: docsIconUrl, size: '34KB', owner: 'Zoey Edwards', updateTime: '2020-01-26 11:01', avatarBg: 'light-blue' },
  ];
</script>

{#snippet renderOperate()}<IconMore />{/snippet}

{#snippet renderName({ value, record }: { value: unknown; record: FileRow })}
  <div><Avatar size="small" shape="square" src={record.nameIconSrc} style="margin-right: 12px" />{value}</div>
{/snippet}

{#snippet renderOwner({ value, record }: { value: unknown; record: FileRow })}
  <div>
    <Avatar size="small" color={record.avatarBg as never} style="margin-right: 4px">
      {typeof value === 'string' ? value.slice(0, 1) : ''}
    </Avatar>{value}
  </div>
{/snippet}

<Table {columns} dataSource={data} pagination={false} />
