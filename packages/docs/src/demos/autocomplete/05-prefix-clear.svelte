<script lang="ts">
  import { AutoComplete } from '@chenzy-design/svelte';

  const all = ['上海', '北京', '广州', '深圳', '杭州', '成都'];
  let value = $state('');
  let data = $state<string[]>([]);

  function onSearch(query: string) {
    data = query ? all.filter((c) => c.includes(query)) : all;
  }
</script>

<div style="width: 260px">
  <!-- prefix 前缀标签 + showClear 一键清空（对齐 Semi） -->
  <AutoComplete
    {data}
    {value}
    showClear
    prefix="城市"
    placeholder="选择城市"
    {onSearch}
    onChange={(v) => (value = String(v))}
  />
</div>
