<!-- 快进快退：seekTime 设置键盘左右键快进快退秒数（focus 在播放器内时生效）。严格对齐 Semi「快进快退」。 -->
<script lang="ts">
  import { VideoPlayer, Select } from '@chenzy-design/svelte';

  const src =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/vchart/landingPage/vchart-show-video.mp4';
  const poster =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/poster2.jpeg';

  let seekTime = $state(5);
</script>

<div>
  <div>
    <span style="margin-bottom:10px">请选择快进快退时间</span>
    <Select
      value={seekTime}
      style="width:100px;margin-left:10px"
      onChange={(v) => (seekTime = v as number)}
      optionList={[
        { label: '5s', value: 5 },
        { label: '10s', value: 10 },
        { label: '15s', value: 15 },
      ]}
      placeholder="请选择快进快退时间"
    />
  </div>
  <VideoPlayer {src} {poster} height={630} style="margin-top:10px" {seekTime} />
</div>
