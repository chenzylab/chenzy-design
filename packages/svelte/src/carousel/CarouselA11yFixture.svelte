<!--
  仅供 Carousel.a11y.test.ts 使用的测试夹具：传入真实 slides Snippet[]。
  count(3) > 1 时渲染箭头/指示器；autoPlay 时渲染播放/暂停按钮（WCAG 2.2.2）。
-->
<script lang="ts">
  import { Carousel } from './index.js';

  interface Props {
    autoPlay?: boolean;
  }
  let { autoPlay = false }: Props = $props();
</script>

{#snippet s1()}
  <div>Slide one</div>
{/snippet}
{#snippet s2()}
  <div>Slide two</div>
{/snippet}
{#snippet s3()}
  <div>Slide three</div>
{/snippet}

<Carousel slides={[s1, s2, s3]} {autoPlay} />
