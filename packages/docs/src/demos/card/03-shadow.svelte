<script lang="ts">
  import { Card } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 16px; flex-wrap: wrap;">
  <div style="width: 200px;"><Card title="无阴影">默认状态</Card></div>
  <div style="width: 200px;"><Card title="悬浮阴影" hoverable>悬停查看效果</Card></div>
  <div style="width: 200px;"><Card title="始终阴影" shadow="always">常驻阴影</Card></div>
</div>
