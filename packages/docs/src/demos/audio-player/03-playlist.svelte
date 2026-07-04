<script lang="ts">
  import { AudioPlayer } from '@chenzy-design/svelte';

  const audioUrl = [
    {
      src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
      title: '曲目一',
    },
    {
      src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
      title: '曲目二',
    },
  ];
</script>

<AudioPlayer {audioUrl} theme="light" />
