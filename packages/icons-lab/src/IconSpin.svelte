<!-- IconSpin — 具名图标，对齐 Semi IconSpin（convertIcon(spin, 'spin')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { spinSvg } from './svgs.js';

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

<Icon svg={spinSvg} type="spin" {...rest} />
