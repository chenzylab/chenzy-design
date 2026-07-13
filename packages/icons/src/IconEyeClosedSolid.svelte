<!-- IconEyeClosedSolid — 具名图标，对齐 Semi IconEyeClosedSolid（convertIcon(eye_closed_solid, 'eye_closed_solid')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { eyeClosedSolidSvg } from './svgs.js';

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

<Icon svg={eyeClosedSolidSvg} type="eye_closed_solid" {...rest} />
