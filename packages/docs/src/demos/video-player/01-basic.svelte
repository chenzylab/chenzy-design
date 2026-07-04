<script lang="ts">
  import { VideoPlayer } from '@chenzy-design/svelte';

  const src =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const poster =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg';
</script>

<VideoPlayer {src} {poster} height={360} />
