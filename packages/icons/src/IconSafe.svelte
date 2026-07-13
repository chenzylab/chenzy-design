<!-- IconSafe — 具名图标，对齐 Semi IconSafe（convertIcon(safe, 'safe')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { safeSvg } from './svgs.js';

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

<Icon svg={safeSvg} type="safe" {...rest} />
