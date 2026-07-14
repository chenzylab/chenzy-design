<script lang="ts">
  import { Tag } from '@chenzy-design/svelte';

  // closable：点击 x 触发 onClose；在 onClose 内 preventDefault 可阻止默认隐藏。
</script>

<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
  <Tag>default tag</Tag>
  <Tag closable>Closable Tag</Tag>
  <Tag closable onClose={(_c, e) => e.preventDefault()}>Closable Tag, Prevent Default</Tag>
</div>
