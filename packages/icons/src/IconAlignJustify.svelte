<!-- IconAlignJustify — 具名图标，对齐 Semi IconAlignJustify（convertIcon(align_justify, 'align_justify')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { alignJustifySvg } from './svgs.js';

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

<Icon svg={alignJustifySvg} type="align_justify" {...rest} />
