<script lang="ts">
  import { Tooltip, Button } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 12px;">
  <Tooltip content="暗色主题（默认）" theme="dark">
    <Button>深色</Button>
  </Tooltip>
  <Tooltip content="浅色主题" theme="light">
    <Button>浅色</Button>
  </Tooltip>
</div>
