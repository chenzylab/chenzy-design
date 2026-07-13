<!-- IconUnlink — 具名图标，对齐 Semi IconUnlink（convertIcon(unlink, 'unlink')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { unlinkSvg } from './svgs.js';

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

<Icon svg={unlinkSvg} type="unlink" {...rest} />
