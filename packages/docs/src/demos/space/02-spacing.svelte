<script lang="ts">
  import { Space, Tag } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">
  <Space spacing="tight">
    <Tag color="primary">tight</Tag>
    <Tag color="primary">tight</Tag>
    <Tag color="primary">tight</Tag>
  </Space>
  <Space spacing="medium">
    <Tag color="success">medium</Tag>
    <Tag color="success">medium</Tag>
    <Tag color="success">medium</Tag>
  </Space>
  <Space spacing="loose">
    <Tag color="warning">loose</Tag>
    <Tag color="warning">loose</Tag>
    <Tag color="warning">loose</Tag>
  </Space>
</div>
