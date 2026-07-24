<script lang="ts">
  // 添加删除项：renderItem 返回带「删除按钮 + 书名」的行，updateList(item) 删除该项；
  // 底部「新增书籍」追加原始 data 中的下一本（对齐 Semi）。
  import { List, Button } from '@chenzy-design/svelte';
  import { IconMinusCircle, IconPlusCircle } from '@chenzy-design/icons';

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
      <div style="margin:4px;" class="list-item">
        <Button type="danger" theme="borderless" icon={minusIcon} onclick={() => updateList(item)} style="margin-right:4px;" />
        {item}
      </div>
    {/snippet}
  </List>
  <div style="margin:4px; font-size:14px;">
    <Button theme="borderless" icon={plusIcon} onclick={() => updateList()} style="color:var(--cd-color-info);">
      新增书籍
    </Button>
  </div>
</div>

{#snippet minusIcon()}
  <IconMinusCircle />
{/snippet}
{#snippet plusIcon()}
  <IconPlusCircle />
{/snippet}

<style>
  :global(.demo-booklist .list-item:hover) {
    background-color: var(--cd-color-fill-0);
  }
</style>
