<!-- IconTwitter — 具名图标，对齐 Semi IconTwitter（convertIcon(twitter, 'twitter')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { twitterSvg } from './svgs.js';

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

<Icon svg={twitterSvg} type="twitter" {...rest} />
