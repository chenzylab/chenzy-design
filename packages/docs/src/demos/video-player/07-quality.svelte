<!--
  清晰度切换：qualityList + defaultQuality + onQualityChange。切换时更新 src（多清晰度靠外部换 src，
  组件本身不含自适应码率）。线路 routeList/defaultRoute/onRouteChange 同理。严格对齐 Semi「清晰度切换」
  （label/value 均为 '1080p'/'480p'，与 Semi md 示例逐字一致）。
-->
<script lang="ts">
  import { VideoPlayer } from '@chenzy-design/svelte';

  const poster =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/poster2.jpeg';
  const playList: { src: string; quality: string }[] = [
    {
      src: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/vchart/landingPage/vchart-show-video.mp4',
      quality: '1080p',
    },
    {
      src: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/video/vchart-show-video-480p.mp4',
      quality: '480p',
    },
  ];

  let src = $state(playList[0]!.src);

  function updateVideoSource(quality: string): void {
    const source = playList.find((item) => item.quality === quality);
    if (source) src = source.src;
  }
</script>

<VideoPlayer
  {src}
  {poster}
  height={630}
  defaultQuality="1080p"
  qualityList={[
    { label: '1080p', value: '1080p' },
    { label: '480p', value: '480p' },
  ]}
  onQualityChange={(quality) => updateVideoSource(quality)}
/>
