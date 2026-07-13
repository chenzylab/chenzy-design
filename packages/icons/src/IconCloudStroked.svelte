<!-- IconCloudStroked — 具名图标，对齐 Semi IconCloudStroked（convertIcon(cloud_stroked, 'cloud_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { cloudStrokedSvg } from './svgs.js';

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

<Icon svg={cloudStrokedSvg} type="cloud_stroked" {...rest} />
