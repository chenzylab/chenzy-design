<!-- IconSideSheet — 具名图标，对齐 Semi IconSideSheet（convertIcon(side-sheet, 'side-sheet')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { sideSheetSvg } from './svgs.js';

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

<Icon svg={sideSheetSvg} type="side-sheet" {...rest} />
