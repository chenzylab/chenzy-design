<script lang="ts">
  import { PinCode, Text, Space } from '@chenzy-design/svelte';
</script>

<Space vertical>
  <Space>
    <PinCode count={4} status="warning" defaultValue="12" />
    <Text type="tertiary">warning 校验态</Text>
  </Space>
  <Space>
    <PinCode count={4} status="error" defaultValue="12" />
    <Text type="tertiary">error 校验态</Text>
  </Space>
  <Space>
    <PinCode count={4} disabled defaultValue="1234" />
    <Text type="tertiary">禁用</Text>
  </Space>
</Space>
