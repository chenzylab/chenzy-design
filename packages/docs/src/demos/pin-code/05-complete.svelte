<script lang="ts">
  import { PinCode, Text, Space } from '@chenzy-design/svelte';

  let done = $state('');
</script>

<Space vertical>
  <PinCode onComplete={(v) => (done = v)} />
  <Text type="tertiary">{done ? `已提交：${done}` : '填满 6 位后自动提交（onComplete）'}</Text>
</Space>
