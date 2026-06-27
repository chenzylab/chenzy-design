<script lang="ts">
  import { Input } from '@chenzy-design/svelte';

  let value = $state('');
</script>

<div style="display: flex; flex-direction: column; gap: 8px; max-width: 320px;">
  <Input bind:value placeholder="请输入内容" />
  <span style="font-size: 12px; color: #86909c;">当前值：{value || '（空）'}</span>
</div>
