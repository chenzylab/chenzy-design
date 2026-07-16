<!-- 基本用法（对齐 Semi）：BackTop 预设了基本的返回按钮，可以直接调用。 -->
<script lang="ts">
  import { BackTop, Text } from '@chenzy-design/svelte';

  let box = $state<HTMLDivElement | null>(null);
</script>

<Text type="tertiary">向下滚动容器，右下角出现灰色返回按钮。</Text>
<div
  bind:this={box}
  style="width:320px; height:200px; overflow:auto; border:1px solid var(--cd-color-border); border-radius:6px; padding:12px; margin-top:8px"
>
  <div style="height:1200px">Scroll down to see the bottom-right gray button.</div>
</div>
<!-- 文档站无 iframe 隔离：BackTop 默认 position:fixed 会落到全站视口，故覆盖为 absolute
     定位到预览区（.demo-box__preview 为 position:relative），模拟 Semi 浮于预览窗口右下角的观感 -->
<BackTop
  target={() => box}
  visibilityHeight={100}
  style="position:absolute; inset-inline-end:24px; inset-block-end:24px"
/>
