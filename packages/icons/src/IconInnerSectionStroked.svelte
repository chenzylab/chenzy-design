<!-- IconInnerSectionStroked — 具名图标，对齐 Semi IconInnerSectionStroked（convertIcon(inner_section_stroked, 'inner_section_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { innerSectionStrokedSvg } from './svgs.js';

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

<Icon svg={innerSectionStrokedSvg} type="inner_section_stroked" {...rest} />
