<script lang="ts">
  import { Switch } from '@chenzy-design/svelte';

  let value = $state(false);
</script>

<div style="display: flex; gap: 12px; align-items: center;">
  <Switch {value} onChange={(c) => (value = c)} />
  <span style="font-size: 12px; color: #86909c;">{value ? '开' : '关'}</span>
</div>
