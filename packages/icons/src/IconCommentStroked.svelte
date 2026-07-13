<!-- IconCommentStroked — 具名图标，对齐 Semi IconCommentStroked（convertIcon(comment_stroked, 'comment_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { commentStrokedSvg } from './svgs.js';

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

<Icon svg={commentStrokedSvg} type="comment_stroked" {...rest} />
