<!-- IconFixedStroked — 具名图标，对齐 Semi IconFixedStroked（convertIcon(fixed_stroked, 'fixed_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { fixedStrokedSvg } from './svgs.js';

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

<Icon svg={fixedStrokedSvg} type="fixed_stroked" {...rest} />
