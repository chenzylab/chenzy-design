<!-- IconCrownStroked — 具名图标，对齐 Semi IconCrownStroked（convertIcon(crown_stroked, 'crown_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { crownStrokedSvg } from './svgs.js';

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

<Icon svg={crownStrokedSvg} type="crown_stroked" {...rest} />
