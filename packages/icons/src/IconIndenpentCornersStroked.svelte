<!-- IconIndenpentCornersStroked — 具名图标，对齐 Semi IconIndenpentCornersStroked（convertIcon(indenpent_corners_stroked, 'indenpent_corners_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { indenpentCornersStrokedSvg } from './svgs.js';

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

<Icon svg={indenpentCornersStrokedSvg} type="indenpent_corners_stroked" {...rest} />
