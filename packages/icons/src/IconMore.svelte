<!-- IconMore — 具名图标，对齐 Semi IconMore（convertIcon(more, 'more')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { moreSvg } from './svgs.js';

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

<Icon svg={moreSvg} type="more" {...rest} />
