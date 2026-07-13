<!-- IconSong — 具名图标，对齐 Semi IconSong（convertIcon(song, 'song')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { songSvg } from './svgs.js';

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

<Icon svg={songSvg} type="song" {...rest} />
