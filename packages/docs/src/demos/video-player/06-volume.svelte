<!-- 音量设置：volume 初始音量、muted 初始静音。严格对齐 Semi「音量设置」。 -->
<script lang="ts">
  import { VideoPlayer } from '@chenzy-design/svelte';

  const src =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/vchart/landingPage/vchart-show-video.mp4';
  const poster =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/poster2.jpeg';
</script>

<VideoPlayer {src} {poster} height={360} volume={30} muted />
