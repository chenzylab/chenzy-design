<script lang="ts">
  import { Table, Avatar, sortable, arrayMove } from '@chenzy-design/svelte';
  import { figmaIconUrl, getData, formatDate, type FileRow } from './_data';

  // 拖拽排序：复刻 Semi（dnd-kit）的思路——拖拽全程只给行叠加 CSS transform 做视觉位移，
  // 不改动 DOM 结构，松手时用 arrayMove 更新 dataSource 顺序（长度守恒，零丢行）。
  // sortable action 挂在包住 Table 的容器上，靠容器委托捕获行的 pointerdown。
  let data = $state<FileRow[]>(getData(10));

  const onReorder = (from: number, to: number) => {
    data = arrayMove(data, from, to);
  };

  const columns = [
    { title: '标题', dataIndex: 'name', width: 400, render: renderName },
    { title: '大小', dataIndex: 'size', render: renderSize },
    { title: '所有者', dataIndex: 'owner', render: renderOwner },
    { title: '更新日期', dataIndex: 'updateTime', render: renderDate },
  ];

  // 给每行加抓取光标（Table 已支持 onRow 透传 style，无需改组件）。
  const onRow = () => ({ style: 'cursor: grab;' });
</script>

{#snippet renderSize({ value }: { value: unknown })}{value} KB{/snippet}
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

<div use:sortable={{ getItemCount: () => data.length, onReorder }}>
  <Table {columns} dataSource={data} rowKey="key" {onRow} pagination={false} />
</div>
