<!-- IconYoutube — 具名图标，对齐 Semi IconYoutube（convertIcon(youtube, 'youtube')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { youtubeSvg } from './svgs.js';

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

<Icon svg={youtubeSvg} type="youtube" {...rest} />
