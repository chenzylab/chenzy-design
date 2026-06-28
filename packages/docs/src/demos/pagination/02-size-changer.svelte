<script lang="ts">
  import { Pagination, Text } from '@chenzy-design/svelte';

  let page = $state(1);
  let pageSize = $state(10);
</script>

<div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start;">
  <Pagination
    total={256}
    currentPage={page}
    pageSize={pageSize}
    showTotal
    showSizeChanger
    showQuickJumper
    onChange={(p, s) => {
      page = p;
      pageSize = s;
    }}
  />
  <Text type="tertiary">第 {page} 页 · 每页 {pageSize} 条</Text>
</div>
