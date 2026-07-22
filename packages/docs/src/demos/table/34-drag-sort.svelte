<script lang="ts">
  import { Table, Avatar } from '@chenzy-design/svelte';
  import { untrack } from 'svelte';
  import { dndzone, type DndEvent } from 'svelte-dnd-action';
  import { figmaIconUrl, getData, formatDate, type FileRow } from './_data';

  // 拖拽排序：Semi 用 dnd-kit（React）+ components.body.row 注入 SortableRow。
  // 本库以 svelte-dnd-action 的 dndzone 挂到 Table 的 tbody（bodyAttach），实现整表行拖拽，
  // 可观察结果一致（技术栈差异：React → Svelte、dnd-kit → svelte-dnd-action）。
  // svelte-dnd-action 默认用每项的 id 字段追踪，补一份 id（= key）供 dnd 使用。
  type DndFileRow = FileRow & { id: string };
  let data = $state<DndFileRow[]>(getData(10).map((r) => ({ ...r, id: r.key })));
  const flipDurationMs = 200;

  const bodyDndzone: import('svelte/attachments').Attachment = (node) => {
    const el = node as HTMLElement;
    // 用可变浅拷贝初始化（勿用 $state.snapshot：其返回不可变，svelte-dnd-action 无法 mutate items 打标）。
    // untrack：主体不追踪 data，避免 data 变化时整个 attachment 重建（响应式更新交给下方 effect）。
    const action = dndzone(el, { items: untrack(() => data.slice()), flipDurationMs });
    // data 变化时同步给 dndzone（嵌套 effect：只 update，不重建、不丢拖拽状态）。
    $effect(() => {
      action.update?.({ items: data.slice(), flipDurationMs });
    });
    const onConsider = (e: Event) => {
      data = (e as CustomEvent<DndEvent<DndFileRow>>).detail.items;
    };
    const onFinalize = (e: Event) => {
      data = (e as CustomEvent<DndEvent<DndFileRow>>).detail.items;
    };
    el.addEventListener('consider', onConsider);
    el.addEventListener('finalize', onFinalize);
    return () => {
      el.removeEventListener('consider', onConsider);
      el.removeEventListener('finalize', onFinalize);
      action.destroy?.();
    };
  };

  const columns = [
    { title: '标题', dataIndex: 'name', width: 400, render: renderName },
    { title: '大小', dataIndex: 'size', render: renderSize },
    { title: '所有者', dataIndex: 'owner', render: renderOwner },
    { title: '更新日期', dataIndex: 'updateTime', render: renderDate },
  ];
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

<Table {columns} dataSource={data} rowKey="key" bodyAttach={bodyDndzone} pagination={false} />
