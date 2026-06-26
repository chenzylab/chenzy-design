<script lang="ts">
  import { Pagination, Text } from '@chenzy-design/svelte';

  let page = $state(1);
  let page2 = $state(1);
  let pageSize2 = $state(10);
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <Pagination total={256} currentPage={page} showTotal onChange={(p) => (page = p)} />
  <Text type="tertiary">当前页：{page}</Text>

  <Pagination
    total={256}
    currentPage={page2}
    pageSize={pageSize2}
    showTotal
    showSizeChanger
    showQuickJumper
    onChange={(p, s) => {
      page2 = p;
      pageSize2 = s;
    }}
  />
  <Text type="tertiary">页 {page2} · 每页 {pageSize2} 条</Text>

  <Text type="tertiary">siblingCount=2 / boundaryCount=2（更多页码、更晚省略）：</Text>
  <div data-testid="pg-sibling">
    <Pagination total={500} currentPage={25} siblingCount={2} boundaryCount={2} />
  </div>

  <Text type="tertiary">hideOnSinglePage（total=8 → 单页隐藏）：</Text>
  <div data-testid="pg-hide">
    <Pagination total={8} hideOnSinglePage />
    <Text type="tertiary">（上方应为空）</Text>
  </div>

  <Text type="tertiary">status=error（跳页输入校验态）：</Text>
  <div data-testid="pg-status">
    <Pagination total={256} status="error" showQuickJumper />
  </div>
</div>
