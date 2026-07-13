<!-- IconFingerLeftStroked — 具名图标，对齐 Semi IconFingerLeftStroked（convertIcon(finger_left_stroked, 'finger_left_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { fingerLeftStrokedSvg } from './svgs.js';

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

<Icon svg={fingerLeftStrokedSvg} type="finger_left_stroked" {...rest} />
