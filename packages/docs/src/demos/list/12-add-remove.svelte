<script lang="ts">
  // 添加删除项：严格对齐 Semi 机制——renderItem 返回带「删除按钮 + 书名」的行，
  // updateList(item) 删除该项；列表底部「新增书籍」追加原始 data 中的下一本。
  // （Semi 用 IconMinusCircle / IconPlusCircle，此处用等价内联 SVG。）
  import { List, Button } from '@chenzy-design/svelte';

  const data = [
    '围城', '平凡的世界（全三册）', '三体（全集）', '雪中悍刀行（全集）',
    '撒哈拉的故事', '明朝那些事', '一禅小和尚', '沙丘',
    '被讨厌的勇气', '罪与罚', '月亮与六便士', '沉默的大多数', '第一人称单数',
  ];

  let list = $state<string[]>(data.slice(0, 8));

  function updateList(item?: string) {
    if (item) {
      list = list.filter((i) => i !== item);
    } else {
      // 追加原始 data 中的下一本（按当前长度取）。
      list = list.concat(data.slice(list.length, list.length + 1));
    }
  }
</script>

<div style="width:280px; display:flex; flex-wrap:wrap; border:1px solid var(--cd-color-border);">
  <List
    dataSource={list}
    split={false}
    size="small"
    class="demo-booklist"
    style="flex-basis:100%; flex-shrink:0; border-bottom:1px solid var(--cd-color-border);"
  >
    {#snippet renderItem(item)}
      <div style="margin:4px; display:flex; align-items:center;" class="list-item">
        <Button type="danger" theme="borderless" onclick={() => updateList(item)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-label="删除">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12h8" stroke-linecap="round" />
          </svg>
        </Button>
        <span style="margin-left:4px;">{item}</span>
      </div>
    {/snippet}
  </List>

  <button
    type="button"
    onclick={() => updateList()}
    style="margin:4px; font-size:14px; display:flex; align-items:center; gap:4px;
           background:none; border:none; cursor:pointer; color:var(--cd-color-info, var(--cd-color-primary));"
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" stroke-linecap="round" />
    </svg>
    新增书籍
  </button>
</div>

<style>
  :global(.demo-booklist .list-item:hover) {
    background-color: var(--cd-color-fill-0);
  }
  :global(.demo-booklist .list-item:active) {
    background-color: var(--cd-color-fill-1);
  }
</style>
