<script lang="ts">
  import { AudioPlayer } from '@chenzy-design/svelte';

  const audioUrl = {
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
    title: '示例音频',
    cover:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
  };
</script>

<AudioPlayer {audioUrl} theme="light" />
