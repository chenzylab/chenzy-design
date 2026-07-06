<script lang="ts">
  import { FloatButton, Text } from '@chenzy-design/svelte';
</script>

<Text type="tertiary">单个悬浮按钮（右下角 fixed 定位，icon-only 需 ariaLabel）。</Text>
<div style="position:relative; height:120px">
  <FloatButton ariaLabel="帮助" style="position:absolute; inset-inline-end:16px; inset-block-end:16px">
    {#snippet icon()}
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M9 9a3 3 0 1 1 4 2.8c-.8.4-1 .9-1 1.7M12 17h.01" />
      </svg>
    {/snippet}
  </FloatButton>
</div>
