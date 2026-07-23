<script lang="ts">
  import { Tooltip, Button, Switch, Space, Typography } from '@chenzy-design/svelte';

  const { Text } = Typography;

  let enabled = $state(true);
  const content = $derived(`condition is ${enabled ? 'true' : 'false'}`);
</script>

<Space align="center">
  <Text>condition</Text>
  <Switch checked={enabled} onChange={(v) => (enabled = v)} />
  <Tooltip {content} trigger="hover" condition={enabled}>
    <Button>Hover me</Button>
  </Tooltip>
  <Tooltip {content} trigger="click" condition={enabled}>
    <Button>Click me</Button>
  </Tooltip>
</Space>
