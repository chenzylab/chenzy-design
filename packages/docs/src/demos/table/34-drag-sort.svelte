<script lang="ts">
  import { Table, Avatar } from '@chenzy-design/svelte';
  import { figmaIconUrl, getData, formatDate, type FileRow } from './_data';

  // 拖拽排序：Semi 用 dnd-kit + components API。本库以原生 HTML5 拖拽 + onRow 返回
  // draggable/事件属性实现同样的行交换效果（技术栈差异，可观察结果一致）。
  let data = $state<FileRow[]>(getData(10));
  let dragKey: string | null = null;

  const columns = [
    { title: '标题', dataIndex: 'name', width: 400, render: renderName },
    { title: '大小', dataIndex: 'size', render: renderSize },
    { title: '所有者', dataIndex: 'owner', render: renderOwner },
    { title: '更新日期', dataIndex: 'updateTime', render: renderDate },
  ];

  const move = (fromKey: string, toKey: string) => {
    const from = data.findIndex((d) => d.key === fromKey);
    const to = data.findIndex((d) => d.key === toKey);
    if (from < 0 || to < 0 || from === to) return;
    const next = [...data];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    data = next;
  };

  const onRow = (record: FileRow) => ({
    draggable: true,
    onDragStart: () => (dragKey = record.key),
    onDrop: () => {
      if (dragKey) move(dragKey, record.key);
      dragKey = null;
    },
  });
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

<Table {columns} dataSource={data} {onRow} pagination={false} />
