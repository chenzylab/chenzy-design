<!-- IconEyeClosed — 具名图标，对齐 Semi IconEyeClosed（convertIcon(eye_closed, 'eye_closed')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { eyeClosedSvg } from './svgs.js';

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

<Icon svg={eyeClosedSvg} type="eye_closed" {...rest} />
