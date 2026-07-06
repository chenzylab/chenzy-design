<script lang="ts">
  import { FloatButton, Text } from '@chenzy-design/svelte';
</script>

<Text type="tertiary">有 href 时渲染真实 <code>&lt;a&gt;</code>；target="_blank" 自动补 rel="noopener noreferrer"。</Text>
<div style="position:relative; height:120px">
  <FloatButton
    ariaLabel="打开文档"
    href="https://semi.design/zh-CN/basic/floatbutton"
    target="_blank"
    style="position:absolute; inset-inline-end:16px; inset-block-end:16px"
  >
    {#snippet icon()}
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M14 3h7v7M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
      </svg>
    {/snippet}
  </FloatButton>
</div>
