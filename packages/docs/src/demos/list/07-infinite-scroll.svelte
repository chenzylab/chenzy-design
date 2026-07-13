<script lang="ts">
  // 滚动加载：严格对齐 Semi 机制（Semi 用 react-infinite-scroller）——
  // count 为已加载批次数（对齐 countRef）；showLoadMore = count % 4 === 0。
  // 首屏加载后 count=1 → 隐藏按钮、滚动到底自动加载；连续加载到 count=4（4%4===0）→ 显示「显示更多」按钮，
  // 点击后又进入 3 批自动滚动……每 4 批一个按钮（避免无节制滚动）。加载中底部显示 Spin。
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
  // 已加载批次计数（对齐 Semi countRef）：slice 用它做起点，加载成功后 +1；需响应式以驱动 showLoadMore。
  let count = $state(0);
  let started = false; // 防重复首屏加载（对齐 Semi useEffect 只跑一次）。

  // 对齐 Semi：showLoadMore = countRef % 4 === 0（在 count 递增之后判定）。
  // 首屏加载成功后 count=1（1%4≠0）→ 隐藏按钮、进入自动滚动；连续到 count=4（4%4===0）→ 显示按钮。
  const showLoadMore = $derived(count % 4 === 0);

  function fetchData() {
    if (loading) return;
    loading = true;
    setTimeout(() => {
      // slice 用递增前的 count 作起点（对齐 Semi dataRef.slice(countRef*count, ...)）。
      const next = all.slice(count * pageSize, count * pageSize + pageSize);
      dataSource = [...dataSource, ...next];
      count += 1; // 成功后递增（对齐 Semi countRef++）。
      loading = false;
      hasMore = next.length > 0;
    }, 1000);
  }

  // 首次挂载即加载第一页（对齐 Semi useEffect(fetchData)）。
  $effect(() => {
    if (!started) {
      started = true;
      fetchData();
    }
  });

  function onScroll(e: Event) {
    // 仅在「自动加载」模式（!showLoadMore，对齐 Semi InfiniteScroll hasMore=!loading&&hasMore&&!showLoadMore）滚动到底触发。
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
