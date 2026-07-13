<!-- IconBookH5Stroked — 具名图标，对齐 Semi IconBookH5Stroked（convertIcon(book_h5_stroked, 'book_h5_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { bookH5StrokedSvg } from './svgs.js';

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

<Icon svg={bookH5StrokedSvg} type="book_h5_stroked" {...rest} />
