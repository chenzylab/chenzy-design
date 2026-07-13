<!-- IconRestoreStroked — 具名图标，对齐 Semi IconRestoreStroked（convertIcon(restore_stroked, 'restore_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { restoreStrokedSvg } from './svgs.js';

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

<Icon svg={restoreStrokedSvg} type="restore_stroked" {...rest} />
