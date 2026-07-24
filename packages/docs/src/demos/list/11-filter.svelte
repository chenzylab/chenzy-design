<script lang="ts">
  // 带筛选器：组合 Input 作为 header，对列表数据实时过滤。
  import { List, Input } from '@chenzy-design/svelte';
  import { IconSearch } from '@chenzy-design/icons';

  const data = [
    '围城', '平凡的世界（全三册）', '三体（全集）', '雪中悍刀行（全集）',
    '撒哈拉的故事', '明朝那些事', '一禅小和尚', '沙丘', '被讨厌的勇气', '罪与罚',
  ];

  let keyword = $state('');
  const list = $derived(keyword ? data.filter((d) => d.includes(keyword)) : data);
</script>

<div style="width:280px; border:1px solid var(--cd-color-border);">
  <List dataSource={list} split={false} size="small">
    {#snippet header()}
      <Input placeholder="搜索" value={keyword} onChange={(v) => (keyword = v)}>
        {#snippet prefix()}
          <IconSearch />
        {/snippet}
      </Input>
    {/snippet}
    {#snippet renderItem(item)}
      <List.Item>{item}</List.Item>
    {/snippet}
  </List>
</div>
