<!-- 快进快退：seekTime 设置键盘左右键快进快退秒数（focus 在播放器内时生效）。严格对齐 Semi「快进快退」。 -->
<script lang="ts">
  import { VideoPlayer } from '@chenzy-design/svelte';

  const src =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/vchart/landingPage/vchart-show-video.mp4';
  const poster =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/poster2.jpeg';

  let seekTime = $state(10);
</script>

<div style="display:flex;flex-direction:column;gap:12px">
  <label>
    快进快退步长：
    <select bind:value={seekTime}>
      <option value={5}>5 秒</option>
      <option value={10}>10 秒</option>
      <option value={15}>15 秒</option>
    </select>
  </label>
  <VideoPlayer {src} {poster} height={360} {seekTime} />
</div>
