<script lang="ts">
  import { AutoComplete, Text } from '@chenzy-design/svelte';

  let value = $state('');
  let data = $state<string[]>([]);
  let loading = $state(false);

  // 远程搜索：onSearch 防抖回调后由外部更新 data，本地不再过滤
  let timer: ReturnType<typeof setTimeout>;
  function search(query: string) {
    clearTimeout(timer);
    if (!query) {
      data = [];
      loading = false;
      return;
    }
    loading = true;
    timer = setTimeout(() => {
      data = Array.from({ length: 5 }, (_, i) => `${query}-结果 ${i + 1}`);
      loading = false;
    }, 600);
  }
</script>

<div style="width: 260px">
  <AutoComplete
    {data}
    {value}
    {loading}
    placeholder="输入关键词远程搜索"
    onSearch={search}
    onChange={(v) => (value = v)}
  />
  <Text type="tertiary">{loading ? '加载中…' : `输入：${value || '（空）'}`}</Text>
</div>
