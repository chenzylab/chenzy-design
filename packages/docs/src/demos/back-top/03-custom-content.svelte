<script lang="ts">
  import { BackTop, Text } from '@chenzy-design/svelte';

  let box = $state<HTMLDivElement | null>(null);
</script>

<Text type="tertiary">用 children 完全自定义按钮内容（文字 + 样式）。</Text>
<div
  bind:this={box}
  style="position:relative; width:320px; height:200px; overflow:auto; border:1px solid var(--cd-color-border); border-radius:6px; padding:12px; margin-top:8px"
>
  <div style="height:1200px">向下滚动查看自定义回顶按钮</div>
  <BackTop
    target={() => box}
    visibilityHeight={120}
    bottom={16}
    right={16}
    ariaLabel="回到顶部"
    class="demo-backtop-text"
  >
    顶部
  </BackTop>
</div>

<style>
  :global(.demo-backtop-text) {
    inline-size: auto;
    block-size: auto;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 12px;
  }
</style>
