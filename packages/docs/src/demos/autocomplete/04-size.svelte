<script lang="ts">
  import { AutoComplete } from '@chenzy-design/svelte';

  const all = ['gmail.com', 'outlook.com', 'qq.com', '163.com'];
  let data = $state<string[]>([]);

  function onSearch(query: string) {
    const q = query.toLowerCase();
    data = q ? all.filter((s) => s.includes(q)) : all;
  }
</script>

<div style="display:flex; flex-direction:column; gap:12px; width:260px">
  <AutoComplete {data} {onSearch} size="small" placeholder="small 小尺寸" />
  <AutoComplete {data} {onSearch} size="default" placeholder="default 默认" />
  <AutoComplete {data} {onSearch} size="large" placeholder="large 大尺寸" />
</div>
