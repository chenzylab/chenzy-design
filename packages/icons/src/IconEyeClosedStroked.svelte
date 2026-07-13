<!-- IconEyeClosedStroked — 具名图标，对齐 Semi IconEyeClosedStroked（convertIcon(eye_closed_stroked, 'eye_closed_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { eyeClosedStrokedSvg } from './svgs.js';

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

<Icon svg={eyeClosedStrokedSvg} type="eye_closed_stroked" {...rest} />
