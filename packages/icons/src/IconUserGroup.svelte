<!-- IconUserGroup — 具名图标，对齐 Semi IconUserGroup（convertIcon(user_group, 'user_group')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { userGroupSvg } from './svgs.js';

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

<Icon svg={userGroupSvg} type="user_group" {...rest} />
