<script lang="ts">
  import { Pagination } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
  <Pagination total={30} />
  <Pagination total={80} />
  <Pagination total={200} />
  <Pagination total={80} pageSize={30} />
</div>
