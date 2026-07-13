<!-- IconPaperclip — 具名图标，对齐 Semi IconPaperclip（convertIcon(paperclip, 'paperclip')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { paperclipSvg } from './svgs.js';

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

<Icon svg={paperclipSvg} type="paperclip" {...rest} />
