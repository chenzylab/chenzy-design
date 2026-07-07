<script lang="ts">
  import { PinCode, Text, Space } from '@chenzy-design/svelte';
</script>

<Space vertical>
  <Space>
    <PinCode autoFocus={false} count={4} />
    <Text type="tertiary">4 位数字</Text>
  </Space>
  <Space>
    <PinCode autoFocus={false} format="mixed" />
    <Text type="tertiary">mixed：数字 + 字母</Text>
  </Space>
</Space>
