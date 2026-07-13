<!-- IconEyedropper — 具名图标，对齐 Semi IconEyedropper（convertIcon(eyedropper, 'eyedropper')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { eyedropperSvg } from './svgs.js';

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

<Icon svg={eyedropperSvg} type="eyedropper" {...rest} />
