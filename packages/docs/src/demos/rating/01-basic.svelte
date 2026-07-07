<script lang="ts">
  import { Rating, Text, Space } from '@chenzy-design/svelte';

  let value = $state(3);
</script>

<Space vertical>
  <Space>
    <Rating {value} onChange={(v) => (value = v)} />
    <Text type="tertiary">评分：{value}</Text>
  </Space>
  <Space>
    <Rating value={2.5} allowHalf readonly />
    <Text type="tertiary">半星只读展示</Text>
  </Space>
</Space>
