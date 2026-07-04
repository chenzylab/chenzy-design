<script lang="ts">
  import { AudioPlayer } from '@chenzy-design/svelte';

  const audioUrl =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';
</script>

<AudioPlayer {audioUrl} theme="light" />
