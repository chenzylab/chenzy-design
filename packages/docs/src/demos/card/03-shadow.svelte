<script lang="ts">
  import { Card } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 16px; flex-wrap: wrap;">
  <Card title="无阴影" style="width: 200px;">默认状态</Card>
  <Card title="悬浮阴影" hoverable style="width: 200px;">悬停查看效果</Card>
  <Card title="始终阴影" shadow="always" style="width: 200px;">常驻阴影</Card>
</div>
