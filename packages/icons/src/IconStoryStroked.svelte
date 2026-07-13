<!-- IconStoryStroked — 具名图标，对齐 Semi IconStoryStroked（convertIcon(story_stroked, 'story_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { storyStrokedSvg } from './svgs.js';

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

<Icon svg={storyStrokedSvg} type="story_stroked" {...rest} />
