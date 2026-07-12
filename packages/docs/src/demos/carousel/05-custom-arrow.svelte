<script lang="ts">
  import { Carousel } from '@chenzy-design/svelte';

  const bgs = ['var(--cd-color-primary)', 'var(--cd-color-success)', 'var(--cd-color-warning)'];
</script>

{#snippet s0()}<div style="width:100%;height:100%;background:{bgs[0]}"></div>{/snippet}
{#snippet s1()}<div style="width:100%;height:100%;background:{bgs[1]}"></div>{/snippet}
{#snippet s2()}<div style="width:100%;height:100%;background:{bgs[2]}"></div>{/snippet}

<!-- 自定义箭头图标：通过 arrowProps.{left,right}Arrow.children 覆盖默认 Icon -->
{#snippet leftIcon()}
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
    <path d="M19 12H5M5 12l6 6M5 12l6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}
{#snippet rightIcon()}
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
    <path d="M5 12h14M19 12l-6 6M19 12l-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}

<Carousel
  slides={[s0, s1, s2]}
  theme="dark"
  autoPlay={false}
  arrowProps={{ leftArrow: { children: leftIcon }, rightArrow: { children: rightIcon } }}
  style="width:100%;height:400px"
/>
