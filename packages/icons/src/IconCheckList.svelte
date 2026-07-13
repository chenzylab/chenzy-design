<!-- IconCheckList — 具名图标，对齐 Semi IconCheckList（convertIcon(check_list, 'check_list')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { checkListSvg } from './svgs.js';

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

<Icon svg={checkListSvg} type="check_list" {...rest} />
