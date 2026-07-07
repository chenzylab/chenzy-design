<script lang="ts">
  import { AutoComplete } from '@chenzy-design/svelte';

  const data = ['gmail.com', '163.com', 'qq.com', 'outlook.com'];
</script>

<div style="display:flex;gap:24px;padding:80px 0">
  <!-- position 控制浮层位置：底部（默认）/ 顶部 -->
  <AutoComplete
    {data}
    openOnFocus
    position="bottomLeft"
    placeholder="bottomLeft（默认）"
    style="width:180px"
  />
  <AutoComplete
    {data}
    openOnFocus
    position="topLeft"
    placeholder="topLeft（向上展开）"
    style="width:180px"
  />
</div>
