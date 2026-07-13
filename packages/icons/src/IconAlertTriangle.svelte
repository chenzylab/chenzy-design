<!-- IconAlertTriangle — 具名图标，对齐 Semi IconAlertTriangle（convertIcon(alert_triangle, 'alert_triangle')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { alertTriangleSvg } from './svgs.js';

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

<Icon svg={alertTriangleSvg} type="alert_triangle" {...rest} />
