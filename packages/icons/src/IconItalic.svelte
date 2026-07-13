<!-- IconItalic — 具名图标，对齐 Semi IconItalic（convertIcon(italic, 'italic')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { italicSvg } from './svgs.js';

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

<Icon svg={italicSvg} type="italic" {...rest} />
