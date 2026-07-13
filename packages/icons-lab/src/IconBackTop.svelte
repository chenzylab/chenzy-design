<!-- IconBackTop — 具名图标，对齐 Semi IconBackTop（convertIcon(back-top, 'back-top')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { backTopSvg } from './svgs.js';

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

<Icon svg={backTopSvg} type="back-top" {...rest} />
