<!-- IconRedo — 具名图标，对齐 Semi IconRedo（convertIcon(redo, 'redo')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { redoSvg } from './svgs.js';

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

<Icon svg={redoSvg} type="redo" {...rest} />
