<script lang="ts">
  import { Carousel } from '@chenzy-design/svelte';

  const bgs = ['var(--cd-color-primary)', 'var(--cd-color-success)', 'var(--cd-color-warning)'];
</script>

{#snippet s0()}<div style="width:100%;height:100%;background:{bgs[0]}"></div>{/snippet}
{#snippet s1()}<div style="width:100%;height:100%;background:{bgs[1]}"></div>{/snippet}
{#snippet s2()}<div style="width:100%;height:100%;background:{bgs[2]}"></div>{/snippet}

<!-- autoPlay 对象形式：interval 控制间隔，hoverToPause 控制悬停是否暂停 -->
<Carousel
  slides={[s0, s1, s2]}
  autoPlay={{ interval: 1500, hoverToPause: true }}
  theme="dark"
  style="width:100%;height:400px"
/>
