<script lang="ts">
  import { Pagination, Text } from '@chenzy-design/svelte';

  // 受控：当前页完全取决于 page，onPageChange 回调后由外部更新（对齐 Semi）。
  let page = $state(3);
</script>

<div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start;">
  <Pagination total={200} currentPage={page} onPageChange={(p) => (page = p)} />
  <Text type="tertiary">当前第 {page} 页</Text>
</div>
