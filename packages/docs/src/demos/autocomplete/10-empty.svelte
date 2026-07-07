<script lang="ts">
  import { AutoComplete, Empty } from '@chenzy-design/svelte';

  let data = $state<number[]>([]);
  let loading = $state(false);
  let timer: ReturnType<typeof setTimeout>;

  function search(query: string) {
    clearTimeout(timer);
    if (!query) {
      data = [];
      loading = false;
      return;
    }
    loading = true;
    // 模拟：远程返回空结果
    timer = setTimeout(() => {
      data = [];
      loading = false;
    }, 500);
  }
</script>

<div style="width: 260px">
  <!-- emptyContent 自定义无候选时的下拉内容 -->
  <AutoComplete
    {data}
    {loading}
    openOnFocus
    placeholder="输入后无结果看空态"
    onSearch={search}
  >
    {#snippet emptyContent()}
      <div style="padding:16px">
        <Empty description="暂无匹配内容" />
      </div>
    {/snippet}
  </AutoComplete>
</div>
