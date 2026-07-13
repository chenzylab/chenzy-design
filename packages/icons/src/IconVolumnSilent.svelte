<!-- IconVolumnSilent — 具名图标，对齐 Semi IconVolumnSilent（convertIcon(volumn_silent, 'volumn_silent')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { volumnSilentSvg } from './svgs.js';

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

<Icon svg={volumnSilentSvg} type="volumn_silent" {...rest} />
