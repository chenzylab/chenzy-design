<!-- 章节标记：markers 在进度条上标注章节点（每个 { start, title }）。严格对齐 Semi「章节标记」。 -->
<script lang="ts">
  import { VideoPlayer } from '@chenzy-design/svelte';

  const src =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/vchart/landingPage/vchart-show-video.mp4';
  const poster =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/poster2.jpeg';

  const markers = [
    { start: 0, title: '片头' },
    { start: 4, title: '功能介绍' },
    { start: 38, title: 'Figma Plugin' },
    { start: 51, title: '片尾' },
  ];
</script>

<VideoPlayer {src} {poster} height={360} {markers} />
