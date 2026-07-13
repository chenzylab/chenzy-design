<!-- IconHelpCircleStroked — 具名图标，对齐 Semi IconHelpCircleStroked（convertIcon(help_circle_stroked, 'help_circle_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { helpCircleStrokedSvg } from './svgs.js';

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

<Icon svg={helpCircleStrokedSvg} type="help_circle_stroked" {...rest} />
