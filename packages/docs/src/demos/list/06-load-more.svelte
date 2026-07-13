<script lang="ts">
  // 加载更多：严格对齐 Semi 机制——点击后先向列表「追加骨架占位行」，请求返回再用真实数据替换。
  // 已展示的真实项（loading:false）始终显示真内容、不被遮罩；只有新追加的占位行显示 Skeleton 骨架。
  import {
    List,
    Avatar,
    Button,
    Skeleton,
    SkeletonAvatar,
    SkeletonTitle,
    SkeletonParagraph,
  } from '@chenzy-design/svelte';

  type Row = { loading: boolean; color?: 'grey'; title?: string };

  const pageSize = 3;
  const all: Row[] = Array.from({ length: 12 }, (_, i) => ({
    loading: false,
    color: 'grey',
    title: `Semi Design Title ${i}`,
  }));

  let list = $state<Row[]>([]);
  let loading = $state(false);
  let noMore = $state(false);
  let loaded = 0; // 已真正加载的条数

  function fetchData() {
    // 1) 先追加 pageSize 个骨架占位行。
    loading = true;
    list = [...list, ...Array.from({ length: pageSize }, () => ({ loading: true }))];
    // 2) 模拟异步请求，返回后用真实数据替换占位行。
    setTimeout(() => {
      const next = all.slice(loaded, loaded + pageSize);
      loaded += next.length;
      // 去掉尾部占位行，替换为真实数据。
      list = [...list.slice(0, list.length - pageSize), ...next];
      loading = false;
      noMore = next.length === 0;
    }, 1000);
  }

  // 首次挂载即加载第一页（对齐 Semi useEffect(fetchData)）。
  $effect(() => {
    if (list.length === 0 && loaded === 0) fetchData();
  });

  function onLoadMore() {
    fetchData();
  }
</script>

<List dataSource={list} bordered>
  {#snippet renderItem(item)}
    <Skeleton loading={(item as Row).loading}>
      {#snippet placeholder()}
        <div style="display:flex; align-items:flex-start; padding:12px; width:100%;">
          <SkeletonAvatar style="margin-right:12px;" />
          <div>
            <SkeletonTitle style="width:120px; margin:12px 0;" />
            <SkeletonParagraph rows={2} style="width:600px; max-width:100%;" />
          </div>
        </div>
      {/snippet}

      <List.Item>
        {#snippet header()}
          <Avatar color={(item as Row).color ?? 'grey'}>SE</Avatar>
        {/snippet}
        {#snippet main()}
          <div>
            <span style="color:var(--cd-color-text-0); font-weight:500;">{(item as Row).title}</span>
            <p style="color:var(--cd-color-text-2); margin:4px 0;">
              Semi Design 设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、用户体验一致的、符合设计规范的 Web 应用。
            </p>
          </div>
        {/snippet}
      </List.Item>
    </Skeleton>
  {/snippet}

  {#snippet loadMore()}
    {#if !loading && !noMore}
      <div style="text-align:center; margin-top:12px; height:32px; line-height:32px;">
        <Button onclick={onLoadMore}>显示更多</Button>
      </div>
    {/if}
  {/snippet}
</List>
