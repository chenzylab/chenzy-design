<!-- IconChevronDown — 具名图标，对齐 Semi IconChevronDown（convertIcon(chevron_down, 'chevron_down')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { chevronDownSvg } from './svgs.js';

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

<Icon svg={chevronDownSvg} type="chevron_down" {...rest} />
