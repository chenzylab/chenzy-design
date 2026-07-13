<!-- IconRestore — 具名图标，对齐 Semi IconRestore（convertIcon(restore, 'restore')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { restoreSvg } from './svgs.js';

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

<Icon svg={restoreSvg} type="restore" {...rest} />
