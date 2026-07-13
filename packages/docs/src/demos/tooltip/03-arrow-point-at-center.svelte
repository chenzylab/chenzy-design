<script lang="ts">
  import { Tooltip, Button } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 20px;">
  <div>
    <Tooltip content="semi design tooltip" position="topLeft">
      <Button>指向元素中心（默认）</Button>
    </Tooltip>
  </div>
  <div>
    <Tooltip content="semi design tooltip" position="topLeft" arrowPointAtCenter={false}>
      <Button style="width: 160px;">边缘对齐</Button>
    </Tooltip>
  </div>
</div>
