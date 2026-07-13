<!-- IconChevronRightStroked — 具名图标，对齐 Semi IconChevronRightStroked（convertIcon(chevron_right_stroked, 'chevron_right_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { chevronRightStrokedSvg } from './svgs.js';

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

<Icon svg={chevronRightStrokedSvg} type="chevron_right_stroked" {...rest} />
