<!-- 设置菜单栏功能：controlsList 控制展示哪些控件（及顺序）。严格对齐 Semi「设置菜单栏功能」。 -->
<script lang="ts">
  import { VideoPlayer } from '@chenzy-design/svelte';

  const src =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/vchart/landingPage/vchart-show-video.mp4';
  const poster =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/poster2.jpeg';
</script>

<VideoPlayer
  {src}
  {poster}
  height={360}
  controlsList={['play', 'time', 'volume', 'playbackRate', 'fullscreen']}
/>
