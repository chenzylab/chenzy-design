<!-- IconEyeClosedSolidStroked — 具名图标，对齐 Semi IconEyeClosedSolidStroked（convertIcon(eye_closed_solid_stroked, 'eye_closed_solid_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { eyeClosedSolidStrokedSvg } from './svgs.js';

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

<Icon svg={eyeClosedSolidStrokedSvg} type="eye_closed_solid_stroked" {...rest} />
