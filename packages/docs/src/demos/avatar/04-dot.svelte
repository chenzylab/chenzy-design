<script lang="ts">
  import { Avatar } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 16px; align-items: center;">
  <Avatar alt="默认" dot />
  <Avatar alt="警告" dot status="warning" />
  <Avatar alt="错误" dot status="error" />
</div>
