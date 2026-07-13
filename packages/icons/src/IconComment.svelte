<!-- IconComment — 具名图标，对齐 Semi IconComment（convertIcon(comment, 'comment')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { commentSvg } from './svgs.js';

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

<Icon svg={commentSvg} type="comment" {...rest} />
