<script lang="ts">
  import { Pagination } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
  <Pagination total={80} showQuickJumper />
  <Pagination total={300} showQuickJumper />
</div>
