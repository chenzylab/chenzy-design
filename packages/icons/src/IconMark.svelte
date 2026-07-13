<!-- IconMark — 具名图标，对齐 Semi IconMark（convertIcon(mark, 'mark')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { markSvg } from './svgs.js';

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

<Icon svg={markSvg} type="mark" {...rest} />
