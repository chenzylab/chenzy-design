<!--
  隐藏工具栏：showToolbar={false} 时不渲染音量/快退/快进/倍速/刷新工具栏，仅保留播放控制 + 进度。
  严格对齐 Semi「隐藏工具栏」。
-->
<script lang="ts">
  import { AudioPlayer } from '@chenzy-design/svelte';

  const audio1 =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/components/audio1.mp3';
</script>

<div style="width: 100%">
  <AudioPlayer
    autoPlay={false}
    audioUrl={{ src: audio1, title: '音频标题' }}
    showToolbar={false}
  />
</div>
