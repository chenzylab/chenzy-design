<script lang="ts">
  import { Switch, Text } from '@chenzy-design/svelte';

  let switchOn = $state(true);
</script>

<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
  <Switch value={switchOn} onChange={(v) => (switchOn = v)} />
  <Text>开关：{switchOn ? '开' : '关'}</Text>
  <Switch disabled />
  <Switch loading />
</div>
