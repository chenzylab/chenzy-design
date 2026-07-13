<!-- IconChevronUpDown — 具名图标，对齐 Semi IconChevronUpDown（convertIcon(chevron_up_down, 'chevron_up_down')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { chevronUpDownSvg } from './svgs.js';

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

<Icon svg={chevronUpDownSvg} type="chevron_up_down" {...rest} />
