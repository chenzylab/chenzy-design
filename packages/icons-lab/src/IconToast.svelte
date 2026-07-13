<!-- IconToast — 具名图标，对齐 Semi IconToast（convertIcon(toast, 'toast')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { toastSvg } from './svgs.js';

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

<Icon svg={toastSvg} type="toast" {...rest} />
