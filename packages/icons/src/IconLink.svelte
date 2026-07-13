<!-- IconLink — 具名图标，对齐 Semi IconLink（convertIcon(link, 'link')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { linkSvg } from './svgs.js';

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

<Icon svg={linkSvg} type="link" {...rest} />
