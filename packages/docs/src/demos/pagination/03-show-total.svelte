<script lang="ts">
  import { Pagination } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
  <Pagination total={80} showTotal />
  <Pagination total={200} showTotal />
</div>
