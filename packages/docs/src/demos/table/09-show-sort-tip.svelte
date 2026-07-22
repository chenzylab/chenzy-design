<script lang="ts">
  import { Table, Avatar } from '@chenzy-design/svelte';
  import { figmaIconUrl, docsIconUrl, formatDate, type FileRow } from './_data';

  const columns = [
    { title: '标题', dataIndex: 'name', width: 400, render: renderName },
    {
      title: '大小',
      dataIndex: 'size',
      // sorter 第三参可读当前 sortOrder（对齐 Semi v2.47）：undefined 恒排末尾
      sorter: (r1: FileRow, r2: FileRow, order?: 'ascend' | 'descend') => {
        const a = r1.size as number | undefined;
        const b = r2.size as number | undefined;
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        if (typeof a === 'undefined') return order === 'ascend' ? 1 : -1;
        if (typeof b === 'undefined') return order === 'ascend' ? -1 : 1;
        return 0;
      },
      showSortTip: true,
      render: renderSize,
    },
    { title: '所有者', dataIndex: 'owner', render: renderOwner },
    { title: '更新日期', dataIndex: 'updateTime', render: renderDate },
  ];

  const dataSource: FileRow[] = [
    { key: '1', name: 'Semi Design 设计稿.fig', nameIconSrc: figmaIconUrl, size: 3, owner: '姜鹏志', updateTime: '2020-02-02 05:13', avatarBg: 'grey' },
    { key: '2', name: 'Semi Design 分享演示文稿', nameIconSrc: docsIconUrl, size: undefined as unknown as number, owner: '郝宣', updateTime: '2020-01-17 05:31', avatarBg: 'red' },
    { key: '3', name: '设计文档 3', nameIconSrc: docsIconUrl, size: 1, owner: 'Zoey Edwards', updateTime: '2020-01-26 11:01', avatarBg: 'light-blue' },
    { key: '4', name: '设计文档 4', nameIconSrc: docsIconUrl, size: 5, owner: 'Zoey Edwards', updateTime: '2020-01-26 11:01', avatarBg: 'light-blue' },
    { key: '5', name: '设计文档 5', nameIconSrc: docsIconUrl, size: undefined as unknown as number, owner: 'Zoey Edwards', updateTime: '2020-01-26 11:01', avatarBg: 'light-blue' },
    { key: '6', name: '设计文档 6', nameIconSrc: docsIconUrl, size: 2, owner: 'Zoey Edwards', updateTime: '2020-01-26 11:01', avatarBg: 'light-blue' },
  ];
</script>

{#snippet renderSize({ value }: { value: unknown })}{value != null ? `${value} KB` : '未知'}{/snippet}
{#snippet renderDate({ value }: { value: unknown })}{formatDate(value)}{/snippet}

{#snippet renderName({ value }: { value: unknown })}
  <div><Avatar size="small" shape="square" src={figmaIconUrl} style="margin-right: 12px" />{value}</div>
{/snippet}

{#snippet renderOwner({ value, record }: { value: unknown; record: FileRow })}
  <div>
    <Avatar size="small" color={record.avatarBg as never} style="margin-right: 4px">
      {typeof value === 'string' ? value.slice(0, 1) : ''}
    </Avatar>{value}
  </div>
{/snippet}

<Table {columns} {dataSource} />
