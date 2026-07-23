<script lang="ts">
  import { Tooltip, Button } from '@chenzy-design/svelte';
</script>

<div>
  <Tooltip position="topLeft" content="semi design tooltip">
    <Button type="secondary" style="margin-right: 8px;">指向元素中心</Button>
  </Tooltip>
</div>

<div style="margin-top: 20px;">
  <Tooltip content="semi design tooltip" arrowPointAtCenter={false} position="topLeft">
    <Button type="secondary" style="margin-right: 8px; width: 120px;">边缘对齐</Button>
  </Tooltip>
</div>
