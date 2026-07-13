<script lang="ts">
  // 响应键盘事件：严格对齐 Semi 机制——监听 window 的 keydown（↑=38 / ↓=40），
  // 循环移动 hoverIndex，命中项加 active-item class 高亮（背景色）。list 取前 10 本。
  import { List } from '@chenzy-design/svelte';

  const data = [
    '围城', '平凡的世界（全三册）', '三体（全集）', '雪中悍刀行（全集）',
    '撒哈拉的故事', '明朝那些事', '一禅小和尚', '沙丘',
    '被讨厌的勇气', '罪与罚', '月亮与六便士', '沉默的大多数', '第一人称单数',
  ];
  const list = data.slice(0, 10);

  let hoverIndex = $state(-1);

  function changeIndex(offset: number) {
    let index = hoverIndex + offset;
    if (index < 0) index = list.length - 1;
    if (index >= list.length) index = 0;
    hoverIndex = index;
  }

  // window 全局 keydown 监听 + cleanup（对齐 Semi useEffect 里 addEventListener/removeEventListener）。
  $effect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        changeIndex(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        changeIndex(1);
      }
    }
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  });
</script>

<div
  style="width:280px; display:flex; flex-wrap:wrap; border:1px solid var(--cd-color-border);"
  class="demo-booklist"
>
  <List
    dataSource={list}
    split={false}
    size="small"
    style="flex-basis:100%; flex-shrink:0; border-bottom:1px solid var(--cd-color-border);"
  >
    {#snippet renderItem(item, index)}
      <List.Item class={index === hoverIndex ? 'demo-active-item' : ''}>{item}</List.Item>
    {/snippet}
  </List>
</div>

<p style="color:var(--cd-color-text-2); font-size:12px; margin-top:8px;">
  按 ↑ / ↓ 方向键切换高亮项。
</p>

<style>
  :global(.demo-booklist .demo-active-item) {
    background-color: var(--cd-color-fill-0);
  }
</style>
