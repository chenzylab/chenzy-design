<script lang="ts">
  import { Switch, Text } from '@chenzy-design/svelte';

  let value = $state(false);
</script>

<div style="display: flex; gap: 12px; align-items: center;">
  <Switch {value} onChange={(c) => (value = c)} />
  <Text>{value ? '已开启' : '已关闭'}</Text>
</div>
