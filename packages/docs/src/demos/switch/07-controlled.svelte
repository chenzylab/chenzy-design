<script lang="ts">
  import { Switch, Button } from '@chenzy-design/svelte';

  let value = $state(false);
</script>

<div style="display: flex; gap: 12px; align-items: center;">
  <Switch {value} onChange={(v) => (value = v)} />
  <Button onclick={() => (value = !value)}>切换</Button>
</div>
