<script lang="ts">
  import { BackTop, Text } from '@chenzy-design/svelte';

  let box = $state<HTMLDivElement | null>(null);
</script>

<Text type="tertiary">阈值 40px 即显示，回顶动画时长 1200ms（更慢更平滑）。</Text>
<div
  bind:this={box}
  style="position:relative; width:320px; height:200px; overflow:auto; border:1px solid var(--cd-color-border); border-radius:6px; padding:12px; margin-top:8px"
>
  <div style="height:1400px">向下滚动一点点即可触发</div>
  <BackTop
    target={() => box}
    visibilityHeight={40}
    duration={1200}
    bottom={16}
    right={16}
    size="small"
  />
</div>
