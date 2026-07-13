<!-- IconArrowLeft — 具名图标，对齐 Semi IconArrowLeft（convertIcon(arrow_left, 'arrow_left')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { arrowLeftSvg } from './svgs.js';

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

<Icon svg={arrowLeftSvg} type="arrow_left" {...rest} />
