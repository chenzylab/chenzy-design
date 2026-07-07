<script lang="ts">
  import { Input, Button, Space, Text } from '@chenzy-design/svelte';

  let value = $state('受控内容');
</script>

<Space vertical align="start">
  <!-- 受控：value 完全由外部持有，配合 onChange -->
  <div style="max-width:320px;width:320px">
    <Input value={value} onChange={(v) => (value = v)} placeholder="受控输入" />
  </div>
  <Space>
    <Button size="small" onclick={() => (value = 'Hello')}>设为 Hello</Button>
    <Button size="small" type="tertiary" onclick={() => (value = '')}>清空</Button>
  </Space>
  <Text type="tertiary">当前值：{value || '（空）'}</Text>
</Space>
