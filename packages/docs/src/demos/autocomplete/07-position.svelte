<script lang="ts">
  import { AutoComplete } from '@chenzy-design/svelte';

  const all = ['gmail.com', '163.com', 'qq.com', 'outlook.com'];
  let data = $state<string[]>([]);

  function onSearch(query: string) {
    const q = query.toLowerCase();
    data = q ? all.filter((s) => s.includes(q)) : all;
  }
</script>

<div style="display:flex;gap:24px;padding:80px 0">
  <!-- position 控制浮层位置：底部（默认）/ 顶部 -->
  <AutoComplete
    {data}
    {onSearch}
    position="bottomLeft"
    placeholder="bottomLeft（默认）"
    style="width:180px"
  />
  <AutoComplete
    {data}
    {onSearch}
    position="topLeft"
    placeholder="topLeft（向上展开）"
    style="width:180px"
  />
</div>
