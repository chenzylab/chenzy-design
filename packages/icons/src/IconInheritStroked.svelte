<!-- IconInheritStroked — 具名图标，对齐 Semi IconInheritStroked（convertIcon(inherit_stroked, 'inherit_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { inheritStrokedSvg } from './svgs.js';

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

<Icon svg={inheritStrokedSvg} type="inherit_stroked" {...rest} />
