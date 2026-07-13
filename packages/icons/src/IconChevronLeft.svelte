<!-- IconChevronLeft — 具名图标，对齐 Semi IconChevronLeft（convertIcon(chevron_left, 'chevron_left')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { chevronLeftSvg } from './svgs.js';

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

<Icon svg={chevronLeftSvg} type="chevron_left" {...rest} />
