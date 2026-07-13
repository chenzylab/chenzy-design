<!-- IconHeartStroked — 具名图标，对齐 Semi IconHeartStroked（convertIcon(heart_stroked, 'heart_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { heartStrokedSvg } from './svgs.js';

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

<Icon svg={heartStrokedSvg} type="heart_stroked" {...rest} />
