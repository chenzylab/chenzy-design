<!-- 基本用法：传入 src / poster / height 即可播放。严格对齐 Semi「基本用法」。 -->
<script lang="ts">
  import { VideoPlayer } from '@chenzy-design/svelte';

  const src =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/vchart/landingPage/vchart-show-video.mp4';
  const poster =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/poster2.jpeg';
</script>

<VideoPlayer {src} {poster} height={630} />
