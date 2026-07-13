<!-- IconList — 具名图标，对齐 Semi IconList（convertIcon(list, 'list')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { listSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={listSvg} type="list" {...rest} />
