<script lang="ts">
  import { Pagination, Text } from '@chenzy-design/svelte';

  let page = $state(1);
</script>

<div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start;">
  <Pagination total={256} currentPage={page} showTotal onChange={(p) => (page = p)} />
  <Text type="tertiary">当前第 {page} 页</Text>
</div>
