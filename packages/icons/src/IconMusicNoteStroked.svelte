<!-- IconMusicNoteStroked — 具名图标，对齐 Semi IconMusicNoteStroked（convertIcon(music_note_stroked, 'music_note_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { musicNoteStrokedSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    fill?: string;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={musicNoteStrokedSvg} type="music_note_stroked" {...rest} />
