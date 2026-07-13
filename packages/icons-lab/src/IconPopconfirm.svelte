<!-- IconPopconfirm — 具名图标，对齐 Semi IconPopconfirm（convertIcon(popconfirm, 'popconfirm')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { popconfirmSvg } from './svgs.js';

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

<Icon svg={popconfirmSvg} type="popconfirm" {...rest} />
