<!--
  使用 ref 控制：bind videoRef 拿到原生 <video> 元素，直接命令式 play/pause。
  此例两个播放器同步播放/暂停。严格对齐 Semi「使用 ref 控制」（Semi 用 forwardRef/ref）。
-->
<script lang="ts">
  import { VideoPlayer } from '@chenzy-design/svelte';

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

<div style="display:flex;flex-direction:column;gap:12px">
  <div style="display:flex;gap:8px">
    <button type="button" onclick={playBoth}>同步播放</button>
    <button type="button" onclick={pauseBoth}>同步暂停</button>
  </div>
  <div style="display:flex;gap:12px;flex-wrap:wrap">
    <VideoPlayer bind:videoRef={ref1} {src} {poster} width={320} height={200} />
    <VideoPlayer bind:videoRef={ref2} {src} {poster} width={320} height={200} />
  </div>
</div>
