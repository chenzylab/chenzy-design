<script lang="ts">
  // 拖拽排序：对齐 Semi 机制（Semi 用 dnd-kit 垂直排序）——每项外层容器独立 border + marginBottom、
  // cursor:grabbing，拖拽结束按 over 目标 arrayMove 重排，拖拽中高亮。Svelte 无 dnd-kit，用原生
  // HTML5 draggable 等价实现同样的垂直排序与视觉。
  import { List, Avatar } from '@chenzy-design/svelte';

  type Row = { id: number; title: string; color: 'red' | 'grey' | 'light-green' | 'light-blue' | 'pink' };

  let listItems = $state<Row[]>([
    { id: 1, title: 'Semi Design Title 1', color: 'red' },
    { id: 2, title: 'Semi Design Title 2', color: 'grey' },
    { id: 3, title: 'Semi Design Title 3', color: 'light-green' },
    { id: 4, title: 'Semi Design Title 4', color: 'light-blue' },
    { id: 5, title: 'Semi Design Title 5', color: 'pink' },
  ]);

  let dragId = $state(-1);
  let overId = $state(-1);

  function arrayMove<T>(arr: T[], from: number, to: number): T[] {
    const next = [...arr];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  }

  function handleDragEnd() {
    if (dragId !== -1 && overId !== -1 && dragId !== overId) {
      const oldIndex = listItems.findIndex((it) => it.id === dragId);
      const newIndex = listItems.findIndex((it) => it.id === overId);
      listItems = arrayMove(listItems, oldIndex, newIndex);
    }
    dragId = -1;
    overId = -1;
  }
</script>

<div style="padding:12px; border:1px solid var(--cd-color-border);">
  <List dataSource={listItems}>
    {#snippet renderItem(item)}
      {@const dragging = dragId === item.id}
      <div
        role="button"
        tabindex="0"
        aria-label={`拖拽排序：${item.title}`}
        draggable="true"
        ondragstart={() => (dragId = item.id)}
        ondragover={(e) => {
          e.preventDefault();
          overId = item.id;
        }}
        ondrop={handleDragEnd}
        ondragend={handleDragEnd}
        style="border:1px solid var(--cd-color-border); margin-bottom:12px; cursor:grabbing;
               {dragging ? 'position:relative; z-index:999; background:var(--cd-color-bg-0);' : ''}
               {overId === item.id && !dragging ? 'outline:1px dashed var(--cd-color-primary);' : ''}"
      >
        <List.Item>
          {#snippet header()}
            <Avatar color={item.color}>SE</Avatar>
          {/snippet}
          {#snippet main()}
            <div>
              <span style="color:var(--cd-color-text-0); font-weight:500;">{item.title}</span>
              <p style="color:var(--cd-color-text-2); margin:4px 0;">
                Semi Design 设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、用户体验一致的、符合设计规范的 Web 应用。
              </p>
            </div>
          {/snippet}
        </List.Item>
      </div>
    {/snippet}
  </List>
</div>
