<script lang="ts">
  import { BackTop, Text } from '@chenzy-design/svelte';

  let box = $state<HTMLDivElement | null>(null);
  let shown = $state(false);
  let arrived = $state(0);
</script>

<Text type="tertiary">
  监听 onVisibleChange / onScrollEnd：当前显隐 {shown ? '显示' : '隐藏'}，到顶 {arrived} 次。
</Text>
<div
  bind:this={box}
  style="position:relative; width:320px; height:200px; overflow:auto; border:1px solid var(--cd-color-border); border-radius:6px; padding:12px; margin-top:8px"
>
  <div style="height:1200px">向下滚动后点击按钮，观察上方计数</div>
  <BackTop
    target={() => box}
    visibilityHeight={120}
    bottom={16}
    right={16}
    size="small"
    onVisibleChange={(info) => (shown = info.visible)}
    onScrollEnd={() => (arrived += 1)}
  />
</div>
