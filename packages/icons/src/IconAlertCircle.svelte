<!-- IconAlertCircle — 具名图标，对齐 Semi IconAlertCircle（convertIcon(alert_circle, 'alert_circle')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { alertCircleSvg } from './svgs.js';

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

<Icon svg={alertCircleSvg} type="alert_circle" {...rest} />
