<!-- IconCaretup — 具名图标，对齐 Semi IconCaretup（convertIcon(caretup, 'caretup')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { caretupSvg } from './svgs.js';

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

<Icon svg={caretupSvg} type="caretup" {...rest} />
