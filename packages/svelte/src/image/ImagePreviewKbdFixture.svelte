<!--
  仅供 ImagePreview.kbd.test.ts（browser project）使用的灯箱 e2e 夹具。
  独立用法直接控制 ImagePreview（src 数组 + visible/currentIndex 受控）。
  trigger 按钮先获焦作为焦点归还锚点：测试先聚焦 trigger 再开灯箱，
  验证 focus trap（焦点入灯箱）、←→ 翻页、Esc 关闭归还 trigger。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import ImagePreview from './ImagePreview.svelte';

  const src = [
    'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  ];

  let visible = $state(false);
  let current = $state(0);
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="trigger" onclick={() => (visible = true)}>open lightbox</button>
  <ImagePreview
    {src}
    {visible}
    currentIndex={current}
    infinite
    onVisibleChange={(v) => (visible = v)}
    onChange={(i) => (current = i)}
  />
</LocaleProvider>
