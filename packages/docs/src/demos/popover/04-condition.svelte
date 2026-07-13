<script lang="ts">
  import { Popover, Button, Switch, Space } from '@chenzy-design/svelte';

  let enabled = $state(true);
  const content = $derived(`condition is ${enabled ? 'true' : 'false'}`);
</script>

<Space align="center">
  <span>condition</span>
  <Switch value={enabled} onChange={(v) => (enabled = v)} />
  <Popover {content} condition={enabled}>
    <Button>Hover me</Button>
  </Popover>
  <Popover {content} trigger="click" condition={enabled}>
    <Button>Click me</Button>
  </Popover>
</Space>
