<!-- IconBookStroked — 具名图标，对齐 Semi IconBookStroked（convertIcon(book_stroked, 'book_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { bookStrokedSvg } from './svgs.js';

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

<Icon svg={bookStrokedSvg} type="book_stroked" {...rest} />
