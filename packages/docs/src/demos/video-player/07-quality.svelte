<!--
  清晰度切换：qualityList + defaultQuality + onQualityChange。切换时更新 src（多清晰度靠外部换 src，
  组件本身不含自适应码率）。线路 routeList/defaultRoute/onRouteChange 同理。严格对齐 Semi「清晰度切换」。
-->
<script lang="ts">
  import { VideoPlayer } from '@chenzy-design/svelte';

  const poster =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/poster2.jpeg';
  const sources: Record<string, string> = {
    hd: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/vchart/landingPage/vchart-show-video.mp4',
    sd: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/video/vchart-show-video-480p.mp4',
  };

  const qualityList = [
    { label: '高清', value: 'hd' },
    { label: '标清', value: 'sd' },
  ];

  let currentSrc = $state(sources.hd);

  function onQualityChange(quality: string): void {
    currentSrc = sources[quality] ?? sources.hd;
  }
</script>

<VideoPlayer
  src={currentSrc}
  {poster}
  height={360}
  {qualityList}
  defaultQuality="hd"
  {onQualityChange}
/>
