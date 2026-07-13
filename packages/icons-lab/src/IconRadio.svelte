<!-- IconRadio — 具名图标，对齐 Semi IconRadio（convertIcon(radio, 'radio')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { radioSvg } from './svgs.js';

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

<Icon svg={radioSvg} type="radio" {...rest} />
