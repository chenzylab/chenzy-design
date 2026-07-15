<script lang="ts">
  import { FloatButton, Text } from '@chenzy-design/svelte';
</script>

<Text type="tertiary">带徽章：传 badge 参数时 body 外层包裹 Badge，徽章按 Semi 几何公式贴形状切点定位。</Text>
<div style="position:relative; height:120px">
  <FloatButton
    badge={{ count: 3 }}
    style="position:absolute; bottom:16px; right:16px"
  >
    {#snippet icon()}
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 8a6 6 0 0 1 12 0c0 7 3 5 3 9H3c0-4 3-2 3-9M9 21a3 3 0 0 0 6 0" />
      </svg>
    {/snippet}
  </FloatButton>
</div>
