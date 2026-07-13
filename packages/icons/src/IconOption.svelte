<!-- IconOption — 具名图标，对齐 Semi IconOption（convertIcon(option, 'option')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { optionSvg } from './svgs.js';

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

<Icon svg={optionSvg} type="option" {...rest} />
