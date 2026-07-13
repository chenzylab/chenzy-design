<!-- IconLockStroked — 具名图标，对齐 Semi IconLockStroked（convertIcon(lock_stroked, 'lock_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { lockStrokedSvg } from './svgs.js';

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

<Icon svg={lockStrokedSvg} type="lock_stroked" {...rest} />
