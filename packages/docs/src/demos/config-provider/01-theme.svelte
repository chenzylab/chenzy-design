<script lang="ts">
  import { ConfigProvider, Button, Tag } from '@chenzy-design/svelte';
</script>

<ConfigProvider wrap theme="dark">
  <div style="padding: 20px; border-radius: 8px; background: var(--cd-color-bg-0); color: var(--cd-color-text-0);">
    <p style="margin: 0 0 12px;">这个区块被 ConfigProvider theme="dark" 包裹，内部 token 自动切换为暗色调色板。</p>
    <div style="display: flex; gap: 8px;">
      <Button type="primary">主要按钮</Button>
      <Button>次要按钮</Button>
      <Tag color="success">标签</Tag>
    </div>
  </div>
</ConfigProvider>
