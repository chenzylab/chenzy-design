<script lang="ts">
  import { BackTop, Text } from '@chenzy-design/svelte';

  let box = $state<HTMLDivElement | null>(null);
</script>

<Text type="tertiary">向下滚动容器 ≥ 120px，右下角出现回顶按钮。</Text>
<div
  bind:this={box}
  style="position:relative; width:320px; height:200px; overflow:auto; border:1px solid var(--cd-color-border); border-radius:6px; padding:12px; margin-top:8px"
>
  <div style="height:1200px">容器顶部（向下滚动触发按钮）</div>
  <BackTop target={() => box} visibilityHeight={120} bottom={16} right={16} size="small" />
</div>
