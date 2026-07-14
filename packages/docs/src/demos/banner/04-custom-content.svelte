<script lang="ts">
  import { Banner, Button } from '@chenzy-design/svelte';

  // 可以通过 children 自定义其他渲染内容（渲染于尾部 extra 区）。
</script>

<div style="width: 500px; padding: 20px; border: 1px solid var(--cd-color-border);">
  <Banner
    fullMode={false}
    title="Title"
    type="warning"
    bordered
    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"
  >
    <div style="display: flex; gap: 8px; justify-content: flex-end;">
      <Button theme="light" type="tertiary">No, thanks.</Button>
      <Button type="warning">Sounds great!</Button>
    </div>
  </Banner>
</div>
