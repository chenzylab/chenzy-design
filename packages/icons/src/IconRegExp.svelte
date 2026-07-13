<!-- IconRegExp — 具名图标，对齐 Semi IconRegExp（convertIcon(reg_exp, 'reg_exp')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { regExpSvg } from './svgs.js';

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

<Icon svg={regExpSvg} type="reg_exp" {...rest} />
