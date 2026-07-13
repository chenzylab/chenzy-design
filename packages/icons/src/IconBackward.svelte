<!-- IconBackward — 具名图标，对齐 Semi IconBackward（convertIcon(backward, 'backward')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { backwardSvg } from './svgs.js';

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

<Icon svg={backwardSvg} type="backward" {...rest} />
