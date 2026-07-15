<script lang="ts">
  import { FloatButton, Text } from '@chenzy-design/svelte';
</script>

<Text type="tertiary">有 href 时点击经 JS 跳转（对齐 Semi）；target="_blank" 用 window.open 新开。</Text>
<div style="position:relative; height:120px">
  <FloatButton
    href="https://github.com/chenzylab/chenzy-design"
    target="_blank"
    style="position:absolute; bottom:16px; right:16px"
  >
    {#snippet icon()}
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M14 3h7v7M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
      </svg>
    {/snippet}
  </FloatButton>
</div>
