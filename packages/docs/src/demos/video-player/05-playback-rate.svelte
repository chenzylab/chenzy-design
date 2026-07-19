<!-- 播放速率：playbackRateList 自定义倍速档位。严格对齐 Semi「播放速率」。 -->
<script lang="ts">
  import { VideoPlayer } from '@chenzy-design/svelte';

  const src =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/vchart/landingPage/vchart-show-video.mp4';
  const poster =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/poster2.jpeg';

  const playbackRateList = [
    { label: '0.5x', value: 0.5 },
    { label: '1.0x', value: 1 },
    { label: '1.5x', value: 1.5 },
    { label: '2.0x', value: 2 },
  ];
</script>

<VideoPlayer {src} {poster} height={360} {playbackRateList} defaultPlaybackRate={1} />
