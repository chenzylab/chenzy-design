<script lang="ts">
  import { Select, Text } from '@chenzy-design/svelte';

  let options = $state<{ label: string; value: string }[]>([]);
  let loading = $state(false);
  let timer: ReturnType<typeof setTimeout>;

  // 远程搜索：onSearch 防抖回调后由外部更新 options
  function handleSearch(q: string) {
    clearTimeout(timer);
    if (!q) {
      options = [];
      loading = false;
      return;
    }
    loading = true;
    timer = setTimeout(() => {
      options = Array.from({ length: 5 }, (_, i) => ({
        label: `${q} 结果 ${i + 1}`,
        value: `${q}-${i}`,
      }));
      loading = false;
    }, 500);
  }
</script>

<div style="max-width:280px">
  <Select {options} {loading} filter onSearch={handleSearch} placeholder="输入关键词远程搜索" />
  <Text type="tertiary">{loading ? '加载中…' : '输入触发远程搜索'}</Text>
</div>
