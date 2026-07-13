<!-- IconBytedanceLogo — 具名图标，对齐 Semi IconBytedanceLogo（convertIcon(bytedance_logo, 'bytedance_logo')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { bytedanceLogoSvg } from './svgs.js';

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

<Icon svg={bytedanceLogoSvg} type="bytedance_logo" {...rest} />
