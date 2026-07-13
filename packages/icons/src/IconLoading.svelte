<!-- IconLoading — 具名图标，对齐 Semi IconLoading（convertIcon(loading, 'loading')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { loadingSvg } from './svgs.js';

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

<Icon svg={loadingSvg} type="loading" {...rest} />
