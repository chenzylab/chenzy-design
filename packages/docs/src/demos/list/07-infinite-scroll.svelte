<script lang="ts">
  // 滚动加载：严格对齐 Semi 机制——滚动到底自动加载下一批（threshold），
  // 但每加载到第 4 的倍数批次时改为出现「显示更多」按钮（避免无节制滚动）；加载中底部显示 Spin。
  import { List, Avatar, Button, Spin } from '@chenzy-design/svelte';

  type Row = { color: 'grey'; title: string };

  const pageSize = 5;
  const all: Row[] = Array.from({ length: 100 }, (_, i) => ({
    color: 'grey',
    title: `Semi Design Title ${i}`,
  }));

  let dataSource = $state<Row[]>([]);
  let loading = $state(false);
  let hasMore = $state(true);
  let batch = 0; // 已加载批次数（对齐 Semi countRef）

  // 第 4 的倍数批次显示「显示更多」按钮（对齐 Semi showLoadMore = countRef % 4 === 0）。
  const showLoadMore = $derived(batch % 4 === 0);

  function fetchData() {
    loading = true;
    setTimeout(() => {
      const next = all.slice(batch * pageSize, batch * pageSize + pageSize);
      dataSource = [...dataSource, ...next];
      batch += 1;
      loading = false;
      hasMore = next.length > 0;
    }, 1000);
  }

  // 首次挂载即加载第一页（对齐 Semi useEffect(fetchData)）。
  $effect(() => {
    if (dataSource.length === 0 && batch === 0) fetchData();
  });

  function onScroll(e: Event) {
    // 仅在「自动加载」模式（非按钮模式）下滚动到底触发加载。
    if (loading || !hasMore || showLoadMore) return;
    const el = e.currentTarget as HTMLDivElement;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) fetchData();
  }
</script>

<div
  onscroll={onScroll}
  style="height:420px; overflow:auto; border:1px solid var(--cd-color-border); padding:10px;"
>
  <List dataSource={dataSource}>
    {#snippet renderItem(item)}
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
    {/snippet}

    {#snippet loadMore()}
      {#if !loading && hasMore && showLoadMore}
        <div style="text-align:center; margin-top:12px; height:32px; line-height:32px;">
          <Button onclick={fetchData}>显示更多</Button>
        </div>
      {/if}
    {/snippet}
  </List>

  {#if loading && hasMore}
    <div style="text-align:center;"><Spin /></div>
  {/if}
</div>
