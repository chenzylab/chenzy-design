<!-- IconArrowRight — 具名图标，对齐 Semi IconArrowRight（convertIcon(arrow_right, 'arrow_right')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { arrowRightSvg } from './svgs.js';

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

<Icon svg={arrowRightSvg} type="arrow_right" {...rest} />
