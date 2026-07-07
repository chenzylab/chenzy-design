<script lang="ts">
  import { Rating, Text, Space } from '@chenzy-design/svelte';
</script>

<Space vertical>
  <Space>
    <Rating value={3.5} allowHalf readonly />
    <Text type="tertiary">只读：展示分值，不可交互</Text>
  </Space>
  <Space>
    <Rating value={2} disabled />
    <Text type="tertiary">禁用：置灰且不可交互</Text>
  </Space>
</Space>
