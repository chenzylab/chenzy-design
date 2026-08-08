<!--
  使用 ref 控制：bind videoRef 拿到原生 <video> 元素，直接命令式 play/pause。
  此例两个播放器同步播放/暂停。严格对齐 Semi「使用 ref 控制」（Semi 用 forwardRef/ref）。
-->
<script lang="ts">
  import { VideoPlayer, Button } from '@chenzy-design/svelte';

  const src =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/vchart/landingPage/vchart-show-video.mp4';
  const poster =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/poster2.jpeg';

  let ref1 = $state<HTMLVideoElement | null>(null);
  let ref2 = $state<HTMLVideoElement | null>(null);

  function playBoth(): void {
    void ref1?.play();
    void ref2?.play();
  }
  function pauseBoth(): void {
    ref1?.pause();
    ref2?.pause();
  }
</script>

<div>
  <div style="margin-bottom:12px">
    <Button onclick={playBoth} style="margin-right:8px">同时播放</Button>
    <Button onclick={pauseBoth}>同时暂停</Button>
  </div>
  <div style="display:flex;gap:12px">
    <VideoPlayer bind:videoRef={ref1} {src} {poster} width="50%" height={315} />
    <VideoPlayer bind:videoRef={ref2} {src} {poster} width="50%" height={315} />
  </div>
</div>
