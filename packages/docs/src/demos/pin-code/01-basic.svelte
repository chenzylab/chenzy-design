<script lang="ts">
  import { PinCode, Text, Space } from '@chenzy-design/svelte';

  let value = $state('');
</script>

<Space vertical>
  <PinCode autoFocus={false} {value} onChange={(v) => (value = v)} />
  <Text type="tertiary">当前值：{value || '（空）'}</Text>
</Space>
