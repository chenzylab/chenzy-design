<!--
  仅供 Carousel.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  viewport（role=group, aria-roledescription=slides）count>perView 时 tabindex=0 可聚焦，
  承接 ←/→/Home/End 切换 active slide。非 active slide 设 inert + aria-hidden。
  autoplay 关闭、loop 关闭，使 active slide 变化可确定断言（首/末有界）。
  每张 slide 含 data-slide 标记便于定位。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Carousel from './Carousel.svelte';
</script>

{#snippet s0()}<div data-slide="0">Slide 0</div>{/snippet}
{#snippet s1()}<div data-slide="1">Slide 1</div>{/snippet}
{#snippet s2()}<div data-slide="2">Slide 2</div>{/snippet}

<LocaleProvider locale="en_US">
  <Carousel
    slides={[s0, s1, s2]}
    autoplay={false}
    loop={false}
    ariaLabel="Demo carousel"
  />
</LocaleProvider>
