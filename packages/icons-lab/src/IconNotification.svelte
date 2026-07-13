<!-- IconNotification — 具名图标，对齐 Semi IconNotification（convertIcon(notification, 'notification')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { notificationSvg } from './svgs.js';

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

<Icon svg={notificationSvg} type="notification" {...rest} />
