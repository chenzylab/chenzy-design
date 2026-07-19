<!--
  基本用法：audioUrl 支持四种形态——字符串、对象({src,title,cover})、字符串数组、对象数组。
  数组时启用播放列表（上一首/下一首、ended 自动切下一首、循环）。严格对齐 Semi「基本用法」。
-->
<script lang="ts">
  import { AudioPlayer } from '@chenzy-design/svelte';

  const audio1 =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/components/audio1.mp3';
  const audio2 =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/components/audio2.mp3';
  const cover =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/abstract.jpg';
</script>

<div style="display:flex;flex-direction:column;gap:24px">
  <!-- 字符串 -->
  <AudioPlayer audioUrl={audio1} autoPlay={false} />

  <!-- 对象（带标题 + 封面）-->
  <AudioPlayer audioUrl={{ src: audio1, title: 'Audio One', cover }} autoPlay={false} />

  <!-- 字符串数组（播放列表）-->
  <AudioPlayer audioUrl={[audio1, audio2]} autoPlay={false} />

  <!-- 对象数组（带标题的播放列表）-->
  <AudioPlayer
    audioUrl={[
      { src: audio1, title: 'Audio One', cover },
      { src: audio2, title: 'Audio Two', cover },
    ]}
    autoPlay={false}
  />
</div>
