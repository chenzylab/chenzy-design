<!-- 音量设置：volume 设置初始音量（0-100），muted 设为 true 可静音播放。严格对齐 Semi「音量设置」。 -->
<script lang="ts">
  import { VideoPlayer } from '@chenzy-design/svelte';

  const src =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/vchart/landingPage/vchart-show-video.mp4';
  const poster =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/poster2.jpeg';
</script>

<VideoPlayer {src} {poster} height={630} muted />
