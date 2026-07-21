<script lang="ts">
  import { Tag, Space } from '@chenzy-design/svelte';

  // closable：点击 x 触发 onClose；在 onClose 内 preventDefault 可阻止默认隐藏。
</script>

<div>
  <Space>
    <Tag>default tag</Tag>
    <Tag closable>Closable Tag</Tag>
    <Tag closable onClose={(_c, e) => e.preventDefault()}>Closable Tag, Prevent Default</Tag>
  </Space>
</div>
