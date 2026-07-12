<script lang="ts">
  import { Pagination, Text } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
  <Text type="tertiary">size="small"（紧凑视图）：</Text>
  <Pagination total={90} size="small" />

  <Text type="tertiary">hoverShowPageSelect（hover 页码弹全部页码切换）：</Text>
  <Pagination total={90} size="small" hoverShowPageSelect />
</div>
