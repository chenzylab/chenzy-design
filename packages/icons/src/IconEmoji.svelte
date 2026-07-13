<!-- IconEmoji — 具名图标，对齐 Semi IconEmoji（convertIcon(emoji, 'emoji')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { emojiSvg } from './svgs.js';

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

<Icon svg={emojiSvg} type="emoji" {...rest} />
