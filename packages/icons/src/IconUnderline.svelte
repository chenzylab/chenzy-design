<!-- IconUnderline — 具名图标，对齐 Semi IconUnderline（convertIcon(underline, 'underline')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { underlineSvg } from './svgs.js';

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

<Icon svg={underlineSvg} type="underline" {...rest} />
