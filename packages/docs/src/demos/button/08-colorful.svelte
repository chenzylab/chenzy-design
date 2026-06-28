<script lang="ts">
  import { Button } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
  <!-- colorful + solid：品牌渐变实心 + 白字 -->
  <Button colorful theme="solid">
    {#snippet icon()}
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5z" />
      </svg>
    {/snippet}
    AI 生成
  </Button>

  <!-- colorful + light：浅色渐变底 + 主色文字 -->
  <Button colorful theme="light">智能优化</Button>

  <Button colorful theme="solid" size="large">立即体验</Button>
</div>
