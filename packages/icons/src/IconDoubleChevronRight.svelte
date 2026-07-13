<!-- IconDoubleChevronRight — 具名图标，对齐 Semi IconDoubleChevronRight（convertIcon(double_chevron_right, 'double_chevron_right')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { doubleChevronRightSvg } from './svgs.js';

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

<Icon svg={doubleChevronRightSvg} type="double_chevron_right" {...rest} />
