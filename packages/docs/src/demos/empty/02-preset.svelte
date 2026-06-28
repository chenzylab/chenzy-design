<script lang="ts">
  import { Empty } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 32px; flex-wrap: wrap; justify-content: center;">
  <Empty image="noData" title="暂无数据" />
  <Empty image="noResult" title="无搜索结果" />
  <Empty image="error" title="加载失败" />
</div>
