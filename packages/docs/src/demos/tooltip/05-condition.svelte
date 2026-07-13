<script lang="ts">
  import { Tooltip, Button, Switch, Space } from '@chenzy-design/svelte';

  let enabled = $state(true);
  const content = $derived(`condition is ${enabled ? 'true' : 'false'}`);
</script>

<Space align="center">
  <span>condition</span>
  <Switch value={enabled} onChange={(v) => (enabled = v)} />
  <Tooltip {content} condition={enabled}>
    <Button>Hover me</Button>
  </Tooltip>
  <Tooltip {content} trigger="click" condition={enabled}>
    <Button>Click me</Button>
  </Tooltip>
</Space>
