<!-- IconRedoStroked — 具名图标，对齐 Semi IconRedoStroked（convertIcon(redo_stroked, 'redo_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { redoStrokedSvg } from './svgs.js';

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

<Icon svg={redoStrokedSvg} type="redo_stroked" {...rest} />
