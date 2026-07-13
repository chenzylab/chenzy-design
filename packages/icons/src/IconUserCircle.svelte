<!-- IconUserCircle — 具名图标，对齐 Semi IconUserCircle（convertIcon(user_circle, 'user_circle')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { userCircleSvg } from './svgs.js';

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

<Icon svg={userCircleSvg} type="user_circle" {...rest} />
