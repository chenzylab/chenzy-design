<script lang="ts">
  import { Rating, Text, Space } from '@chenzy-design/svelte';

  let small = $state(3);
  let large = $state(3);
  let ten = $state(7);
</script>

<Space vertical>
  <Space>
    <Rating value={small} size="small" onChange={(v) => (small = v)} />
    <Text type="tertiary">小号：{small}</Text>
  </Space>
  <Space>
    <Rating value={large} size="large" onChange={(v) => (large = v)} />
    <Text type="tertiary">大号：{large}</Text>
  </Space>
  <Space>
    <Rating value={ten} count={10} onChange={(v) => (ten = v)} />
    <Text type="tertiary">十分制（count=10）：{ten}</Text>
  </Space>
</Space>
