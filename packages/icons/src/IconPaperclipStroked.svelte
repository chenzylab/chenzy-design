<!-- IconPaperclipStroked — 具名图标，对齐 Semi IconPaperclipStroked（convertIcon(paperclip_stroked, 'paperclip_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { paperclipStrokedSvg } from './svgs.js';

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

<Icon svg={paperclipStrokedSvg} type="paperclip_stroked" {...rest} />
