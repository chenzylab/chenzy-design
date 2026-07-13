<!-- IconSafeStroked — 具名图标，对齐 Semi IconSafeStroked（convertIcon(safe_stroked, 'safe_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { safeStrokedSvg } from './svgs.js';

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

<Icon svg={safeStrokedSvg} type="safe_stroked" {...rest} />
