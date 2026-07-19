<!-- 主题：theme="light" 浅色主题（默认 dark，仅影响 wrapper/error 背景色）。严格对齐 Semi「主题」。 -->
<script lang="ts">
  import { VideoPlayer } from '@chenzy-design/svelte';

  const src =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/vchart/landingPage/vchart-show-video.mp4';
  const poster =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/poster2.jpeg';
</script>

<VideoPlayer {src} {poster} height={360} theme="light" />
