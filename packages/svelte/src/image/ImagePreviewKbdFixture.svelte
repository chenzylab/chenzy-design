<!--
  仅供 ImagePreview.kbd.test.ts（browser project）使用的灯箱 e2e 夹具。
  直接渲染 ImagePreview（多图）：真实图片加载在 headless 下不可靠，故跳过 Image 触发链，
  直接控制灯箱挂载（show $state）。trigger 按钮先获焦作为焦点归还锚点：
  测试先聚焦 trigger 再开灯箱，验证 focus trap（焦点入灯箱）、←→ 翻页、Esc 关闭归还 trigger。
  current 由父级 $state 维护（受控），onChange 更新它（左右键翻页）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import ImagePreview from './ImagePreview.svelte';

  const images = [
    { src: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', alt: 'image one' },
    { src: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', alt: 'image two' },
    { src: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', alt: 'image three' },
  ];

  let show = $state(false);
  let current = $state(0);
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="trigger" onclick={() => (show = true)}>open lightbox</button>
  {#if show}
    <ImagePreview
      {images}
      {current}
      onClose={() => (show = false)}
      onChange={(i) => (current = i)}
    />
  {/if}
</LocaleProvider>
