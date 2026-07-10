<script lang="ts">
  import { Pagination, Text } from '@chenzy-design/svelte';

  // 两个分页器均从第 5 页、每页 10 条起步，切换每页条数观察 currentPage 差异。
  let pageA = $state(5);
  let sizeA = $state(10);
  let pageB = $state(5);
  let sizeB = $state(10);
</script>

<div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
  <Text type="tertiary">默认：切换每页条数时，按当前首条数据位置重算页码（保持数据位置）。</Text>
  <Pagination
    total={200}
    currentPage={pageA}
    pageSize={sizeA}
    showSizeChanger
    onChange={(p, s) => {
      pageA = p;
      sizeA = s;
    }}
  />
  <Text type="tertiary">第 {pageA} 页 · 每页 {sizeA} 条</Text>

  <Text type="tertiary">preventPageChangeOnPageSizeChange：切换每页条数时保持当前页码不变。</Text>
  <Pagination
    total={200}
    currentPage={pageB}
    pageSize={sizeB}
    showSizeChanger
    preventPageChangeOnPageSizeChange
    onChange={(p, s) => {
      pageB = p;
      sizeB = s;
    }}
  />
  <Text type="tertiary">第 {pageB} 页 · 每页 {sizeB} 条</Text>
</div>
