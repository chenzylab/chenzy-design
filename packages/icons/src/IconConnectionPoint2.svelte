<!-- IconConnectionPoint2 — 具名图标，对齐 Semi IconConnectionPoint2（convertIcon(connection_point_2, 'connection_point_2')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { connectionPoint2Svg } from './svgs.js';

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

<Icon svg={connectionPoint2Svg} type="connection_point_2" {...rest} />
