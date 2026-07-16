<script lang="ts">
  import { Input } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 12px; max-width: 320px;">
  <Input disabled defaultValue="禁用状态" />
  <Input validateStatus="warning" defaultValue="警告状态" />
  <Input validateStatus="error" defaultValue="错误状态" />
</div>
