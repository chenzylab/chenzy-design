<script lang="ts">
  import { Pagination } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
  <Pagination total={300} showSizeChanger pageSizeOpts={[50, 80, 90, 200]} />
  <Pagination total={300} showSizeChanger pageSizeOpts={[10, 20, 50, 200]} />
</div>
