<script lang="ts">
  import { Button } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
    <Button type="primary" disabled>Disabled</Button>
    <Button type="primary" loading>Loading</Button>
  </div>
  <Button type="primary" block>Block 按钮</Button>
</div>
