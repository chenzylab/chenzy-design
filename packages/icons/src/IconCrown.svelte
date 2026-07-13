<!-- IconCrown — 具名图标，对齐 Semi IconCrown（convertIcon(crown, 'crown')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { crownSvg } from './svgs.js';

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

<Icon svg={crownSvg} type="crown" {...rest} />
