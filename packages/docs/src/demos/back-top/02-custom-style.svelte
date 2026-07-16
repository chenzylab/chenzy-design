<!--
  自定义样式（对齐 Semi）：BackTop 预设了默认样式（距底 50px、距右 100px、box-sizing:border-box、
  内容水平居中），样式可以覆盖。用 style 覆盖为蓝色圆形按钮，children 换成 IconArrowUp。
-->
<script lang="ts">
  import { BackTop, Text } from '@chenzy-design/svelte';
  import { IconArrowUp } from '@chenzy-design/icons';

  let box = $state<HTMLDivElement | null>(null);

  const style =
    'position:absolute; display:flex; align-items:center; justify-content:center;' +
    'height:30px; width:30px; border-radius:100%; background-color:#0077fa; color:#fff;' +
    'right:16px; bottom:16px';
</script>

<Text type="tertiary">
  向下滚动容器，右下角出现<span style="color:#0077fa">蓝色圆形</span>按钮。
</Text>
<div
  bind:this={box}
  style="position:relative; width:320px; height:200px; overflow:auto; border:1px solid var(--cd-color-border); border-radius:6px; padding:12px; margin-top:8px"
>
  <div style="height:1200px">
    Scroll down to see the bottom-right
    <span style="color:#0077fa">blue circular</span> button.
  </div>
  <BackTop target={() => box} visibilityHeight={100} {style}>
    <IconArrowUp />
  </BackTop>
</div>
