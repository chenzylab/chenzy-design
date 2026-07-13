<!-- IconUserListStroked — 具名图标，对齐 Semi IconUserListStroked（convertIcon(user_list_stroked, 'user_list_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { userListStrokedSvg } from './svgs.js';

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

<Icon svg={userListStrokedSvg} type="user_list_stroked" {...rest} />
