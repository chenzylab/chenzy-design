<script lang="ts">
  import { FloatButton, Text } from '@chenzy-design/svelte';
</script>

<Text type="tertiary">colorful：AI 风格品牌蓝→紫多彩渐变外观。</Text>
<div style="position:relative; height:120px">
  <FloatButton
    ariaLabel="AI 编辑"
    colorful
    style="position:absolute; inset-inline-end:16px; inset-block-end:16px"
  >
    {#snippet icon()}
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path fill="currentColor" d="m12 2 2.09 5.26L19 8l-4 3.5L16 17l-4-2.5L8 17l1-5.5L5 8l4.91-.74z" />
      </svg>
    {/snippet}
  </FloatButton>
</div>
