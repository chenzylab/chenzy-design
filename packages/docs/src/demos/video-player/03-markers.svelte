<script lang="ts">
  import { VideoPlayer } from '@chenzy-design/svelte';

  const src =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const poster =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg';

  const markers = [
    { start: 0, title: '片头' },
    { start: 15, title: '主要内容' },
    { start: 40, title: '片尾' },
  ];
</script>

<VideoPlayer {src} {poster} {markers} height={360} />
