<script lang="ts">
  import { VideoPlayer } from '@chenzy-design/svelte';

  const src =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const poster =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg';

  // 仅展示播放、时间、音量、倍速、全屏几个控件
  const controlsList = ['play', 'time', 'volume', 'playbackRate', 'fullscreen'];
</script>

<VideoPlayer {src} {poster} {controlsList} height={360} />
