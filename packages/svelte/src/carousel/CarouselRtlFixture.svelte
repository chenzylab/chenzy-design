<!--
  browser project 夹具（真实 chromium）：Carousel 在 LTR / RTL 下的箭头位置。

  起因：该组件的 RTL 规则原本写成 `.cd-carousel:dir(rtl)`，**从未生效** ——
  `:dir()` 只匹配 HTML 的 `dir` 属性，而 ConfigProvider（同 Semi）只注入
  `class="cd-rtl"`，全站 `[dir]` 元素实测为 0。本夹具用于钉住修复后的真实几何。
-->
<script lang="ts">
  import '@chenzy-design/tokens/tokens.css';
  import Carousel from './Carousel.svelte';
  import ConfigProvider from '../config-provider/ConfigProvider.svelte';
</script>

<!-- Carousel 的幻灯片走 `slides` 数组（Snippet[]），不是自由 children；
     箭头仅在 showArrow && slides 数 > 1 时渲染，故必须给两张。 -->
{#snippet slideA()}
  <div style="height: 120px; background: #ddd">A</div>
{/snippet}
{#snippet slideB()}
  <div style="height: 120px; background: #eee">B</div>
{/snippet}

<div data-testid="ltr" style="width: 400px">
  <Carousel showArrow={true} arrowType="always" slides={[slideA, slideB]} />
</div>

<ConfigProvider direction="rtl">
  <div data-testid="rtl" style="width: 400px">
    <Carousel showArrow={true} arrowType="always" slides={[slideA, slideB]} />
  </div>
</ConfigProvider>
