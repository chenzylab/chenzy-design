<!-- IconChevronUp — 具名图标，对齐 Semi IconChevronUp（convertIcon(chevron_up, 'chevron_up')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { chevronUpSvg } from './svgs.js';

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

<Icon svg={chevronUpSvg} type="chevron_up" {...rest} />
