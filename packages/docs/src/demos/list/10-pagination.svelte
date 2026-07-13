<script lang="ts">
  // 带分页器：组合 Pagination 对数据切片，实现分页列表（List 本体不含分页，与 Semi 一致靠组合）。
  import { List, Pagination } from '@chenzy-design/svelte';

  const data = [
    '围城', '平凡的世界（全三册）', '三体（全集）', '雪中悍刀行（全集）',
    '撒哈拉的故事', '明朝那些事', '一禅小和尚', '沙丘',
    '被讨厌的勇气', '罪与罚', '月亮与六便士', '沉默的大多数',
  ];

  const pageSize = 4;
  let page = $state(1);
  const pageData = $derived(data.slice((page - 1) * pageSize, page * pageSize));
</script>

<div style="width:280px;">
  <List
    dataSource={pageData}
    split={false}
    size="small"
    style="border:1px solid var(--cd-color-border);"
  >
    {#snippet renderItem(item)}
      <List.Item>{item}</List.Item>
    {/snippet}
  </List>
  <div style="margin-top:12px; display:flex; justify-content:center;">
    <Pagination
      size="small"
      total={data.length}
      {pageSize}
      currentPage={page}
      onChange={(p) => (page = p)}
    />
  </div>
</div>
