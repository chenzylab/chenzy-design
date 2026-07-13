<!-- IconApartment — 具名图标，对齐 Semi IconApartment（convertIcon(apartment, 'apartment')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { apartmentSvg } from './svgs.js';

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

<Icon svg={apartmentSvg} type="apartment" {...rest} />
