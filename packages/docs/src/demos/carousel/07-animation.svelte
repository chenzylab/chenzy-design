<script lang="ts">
  import { Carousel } from '@chenzy-design/svelte';

  const bgs = ['var(--cd-color-primary)', 'var(--cd-color-success)', 'var(--cd-color-warning)'];
</script>

{#snippet s0()}<div style="width:100%;height:100%;background:{bgs[0]}"></div>{/snippet}
{#snippet s1()}<div style="width:100%;height:100%;background:{bgs[1]}"></div>{/snippet}
{#snippet s2()}<div style="width:100%;height:100%;background:{bgs[2]}"></div>{/snippet}

<!-- animation='fade' 渐隐切换，speed 控制切换时长（ms） -->
<Carousel
  slides={[s0, s1, s2]}
  animation="fade"
  speed={1000}
  theme="dark"
  autoPlay={false}
  style="width:100%;height:400px"
/>
