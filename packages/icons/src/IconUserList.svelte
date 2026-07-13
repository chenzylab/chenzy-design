<!-- IconUserList — 具名图标，对齐 Semi IconUserList（convertIcon(user_list, 'user_list')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { userListSvg } from './svgs.js';

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

<Icon svg={userListSvg} type="user_list" {...rest} />
