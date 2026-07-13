<!-- IconLock — 具名图标，对齐 Semi IconLock（convertIcon(lock, 'lock')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { lockSvg } from './svgs.js';

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

<Icon svg={lockSvg} type="lock" {...rest} />
