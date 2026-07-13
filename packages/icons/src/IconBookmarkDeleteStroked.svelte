<!-- IconBookmarkDeleteStroked — 具名图标，对齐 Semi IconBookmarkDeleteStroked（convertIcon(bookmark_delete_stroked, 'bookmark_delete_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { bookmarkDeleteStrokedSvg } from './svgs.js';

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

<Icon svg={bookmarkDeleteStrokedSvg} type="bookmark_delete_stroked" {...rest} />
