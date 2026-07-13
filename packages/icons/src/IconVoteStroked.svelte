<!-- IconVoteStroked — 具名图标，对齐 Semi IconVoteStroked（convertIcon(vote_stroked, 'vote_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { voteStrokedSvg } from './svgs.js';

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

<Icon svg={voteStrokedSvg} type="vote_stroked" {...rest} />
