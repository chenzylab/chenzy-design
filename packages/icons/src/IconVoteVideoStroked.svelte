<!-- IconVoteVideoStroked — 具名图标，对齐 Semi IconVoteVideoStroked（convertIcon(vote_video_stroked, 'vote_video_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { voteVideoStrokedSvg } from './svgs.js';

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

<Icon svg={voteVideoStrokedSvg} type="vote_video_stroked" {...rest} />
