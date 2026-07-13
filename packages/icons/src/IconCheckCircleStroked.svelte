<!-- IconCheckCircleStroked — 具名图标，对齐 Semi IconCheckCircleStroked（convertIcon(check_circle_stroked, 'check_circle_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { checkCircleStrokedSvg } from './svgs.js';

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

<Icon svg={checkCircleStrokedSvg} type="check_circle_stroked" {...rest} />
