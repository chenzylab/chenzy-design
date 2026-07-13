<!-- IconTextStroked — 具名图标，对齐 Semi IconTextStroked（convertIcon(text_stroked, 'text_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { textStrokedSvg } from './svgs.js';

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

<Icon svg={textStrokedSvg} type="text_stroked" {...rest} />
