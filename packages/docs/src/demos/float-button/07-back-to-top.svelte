<script lang="ts">
  import { FloatButton, Text } from '@chenzy-design/svelte';

  let box = $state<HTMLDivElement | null>(null);

  function toTop() {
    box?.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<Text type="tertiary">recipe：用 FloatButton 作「回到顶部」底座（仅需滚动监听时优先用 BackTop）。</Text>
<div
  bind:this={box}
  style="position:relative; width:320px; height:200px; overflow:auto; border:1px solid var(--cd-color-border); border-radius:6px; padding:12px; margin-top:8px"
>
  <div style="height:1200px">容器顶部（向下滚动后点右下角按钮回顶）</div>
  <FloatButton
    ariaLabel="回到顶部"
    size="small"
    onClick={toTop}
    style="position:absolute; inset-inline-end:12px; inset-block-end:12px"
  >
    {#snippet icon()}
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    {/snippet}
  </FloatButton>
</div>
