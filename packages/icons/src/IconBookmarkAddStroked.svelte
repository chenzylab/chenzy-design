<!-- IconBookmarkAddStroked — 具名图标，对齐 Semi IconBookmarkAddStroked（convertIcon(bookmark_add_stroked, 'bookmark_add_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { bookmarkAddStrokedSvg } from './svgs.js';

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

<Icon svg={bookmarkAddStrokedSvg} type="bookmark_add_stroked" {...rest} />
