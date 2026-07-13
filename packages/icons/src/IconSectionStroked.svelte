<!-- IconSectionStroked — 具名图标，对齐 Semi IconSectionStroked（convertIcon(section_stroked, 'section_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { sectionStrokedSvg } from './svgs.js';

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

<Icon svg={sectionStrokedSvg} type="section_stroked" {...rest} />
