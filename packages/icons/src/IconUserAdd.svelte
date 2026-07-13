<!-- IconUserAdd — 具名图标，对齐 Semi IconUserAdd（convertIcon(user_add, 'user_add')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { userAddSvg } from './svgs.js';

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

<Icon svg={userAddSvg} type="user_add" {...rest} />
