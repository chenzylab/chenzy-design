<!-- IconWholeWord — 具名图标，对齐 Semi IconWholeWord（convertIcon(whole_word, 'whole_word')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { wholeWordSvg } from './svgs.js';

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

<Icon svg={wholeWordSvg} type="whole_word" {...rest} />
