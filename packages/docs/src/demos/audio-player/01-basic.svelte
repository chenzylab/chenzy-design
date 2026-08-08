<!--
  严格复刻 Semi「基本用法」demo：audioUrl 四形态（字符串 / 对象 / 字符串数组 / 对象数组），
  取值、顺序、标题逐项对齐 Semi（字符串形态用 audio2、对象标题「音频标题」、
  对象数组「音频标题1 / 音频标题2」，各实例间距 marginTop 10）。
  数组时启用播放列表（上一首/下一首、ended 自动切下一首、循环）。
-->
<script lang="ts">
  import { AudioPlayer } from '@chenzy-design/svelte';

  const audio1 =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/components/audio1.mp3';
  const audio2 =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/components/audio2.mp3';
  const cover =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/abstract.jpg';

  const audioUrl = audio2;
  const audioUrlArr = [audio1, audio2];
  const audioUrlObj = { src: audio1, title: '音频标题', cover };
  const audioUrlArrObj = [
    { src: audio1, title: '音频标题1', cover },
    { src: audio2, title: '音频标题2', cover },
  ];
</script>

<div style="width: 100%">
  <div style="margin-top: 10px">
    <AudioPlayer autoPlay={false} {audioUrl} />
  </div>
  <div style="margin-top: 10px">
    <AudioPlayer autoPlay={false} audioUrl={audioUrlObj} />
  </div>
  <div style="margin-top: 10px">
    <AudioPlayer autoPlay={false} audioUrl={audioUrlArr} />
  </div>
  <div style="margin-top: 10px">
    <AudioPlayer autoPlay={false} audioUrl={audioUrlArrObj} />
  </div>
</div>
