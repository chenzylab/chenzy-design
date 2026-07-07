<script lang="ts">
  import { PinCode, Button, Text, Space } from '@chenzy-design/svelte';

  let value = $state('69af41');

  function randomize() {
    const chars = '0123456789abcdef';
    value = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
</script>

<Space vertical align="start">
  <!-- 受控：value 由外部持有，可编程式设置 -->
  <Button size="small" onclick={randomize}>随机填入</Button>
  <PinCode format="mixed" value={value} onChange={(v) => (value = v)} autoFocus={false} />
  <Text type="tertiary">当前值：{value || '（空）'}</Text>
</Space>
