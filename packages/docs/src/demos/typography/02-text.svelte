<script lang="ts">
  import { Typography } from '@chenzy-design/svelte';

  const { Text } = Typography;
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <Text>Text</Text>
  <Text type="secondary">Secondary</Text>
  <Text type="tertiary">Tertiary</Text>
  <Text type="quaternary">Quaternary</Text>
  <Text type="warning">Warning</Text>
  <Text type="danger">Danger</Text>
  <Text type="success">Success</Text>
  <Text disabled>Disabled</Text>
  <Text mark>Default Mark</Text>
  <Text code>Example Code</Text>
  <Text underline>Underline</Text>
  <Text delete>Deleted</Text>
  <Text strong>Strong</Text>
</div>
