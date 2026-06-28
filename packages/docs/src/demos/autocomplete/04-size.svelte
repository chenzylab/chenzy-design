<script lang="ts">
  import { AutoComplete } from '@chenzy-design/svelte';

  const data = ['gmail.com', 'outlook.com', 'qq.com', '163.com'];
</script>

<div style="display:flex; flex-direction:column; gap:12px; width:260px">
  <AutoComplete {data} size="small" placeholder="small 小尺寸" />
  <AutoComplete {data} size="default" placeholder="default 默认" />
  <AutoComplete {data} size="large" placeholder="large 大尺寸" />
  <AutoComplete {data} status="error" placeholder="error 错误态" />
</div>
