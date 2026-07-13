<!-- IconUserStroked — 具名图标，对齐 Semi IconUserStroked（convertIcon(user_stroked, 'user_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { userStrokedSvg } from './svgs.js';

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

<Icon svg={userStrokedSvg} type="user_stroked" {...rest} />
