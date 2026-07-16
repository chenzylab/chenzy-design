<!-- 基本用法（对齐 Semi）：BackTop 预设了基本的返回按钮，可以直接调用。 -->
<script lang="ts">
  import { BackTop, Text } from '@chenzy-design/svelte';

  let box = $state<HTMLDivElement | null>(null);
</script>

<Text type="tertiary">向下滚动容器，右下角出现灰色返回按钮。</Text>
<div
  bind:this={box}
  style="position:relative; width:320px; height:200px; overflow:auto; border:1px solid var(--cd-color-border); border-radius:6px; padding:12px; margin-top:8px"
>
  <div style="height:1200px">Scroll down to see the bottom-right gray button.</div>
  <BackTop
    target={() => box}
    visibilityHeight={100}
    style="position:absolute; right:16px; bottom:16px"
  />
</div>
