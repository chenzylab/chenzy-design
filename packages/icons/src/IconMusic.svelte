<!-- IconMusic — 具名图标，对齐 Semi IconMusic（convertIcon(music, 'music')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { musicSvg } from './svgs.js';

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

<Icon svg={musicSvg} type="music" {...rest} />
