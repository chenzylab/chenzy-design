<!-- IconMapPin — 具名图标，对齐 Semi IconMapPin（convertIcon(map_pin, 'map_pin')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { mapPinSvg } from './svgs.js';

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

<Icon svg={mapPinSvg} type="map_pin" {...rest} />
