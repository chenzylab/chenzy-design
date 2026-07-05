<script lang="ts">
  import { PinCode, Text, Space } from '@chenzy-design/svelte';

  let value = $state('');
</script>

<Space direction="vertical">
  <PinCode {value} onChange={(v) => (value = v)} />
  <Text type="tertiary">当前值：{value || '（空）'}</Text>
</Space>
