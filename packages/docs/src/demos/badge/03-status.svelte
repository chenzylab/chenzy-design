<script lang="ts">
  import { Badge } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 8px;">
  <Badge status="default" count="默认" />
  <Badge status="processing" count="处理中" />
  <Badge status="success" count="已完成" />
  <Badge status="warning" count="待处理" />
  <Badge status="error" count="已失败" />
</div>
