<!-- IconTextRectangle — 具名图标，对齐 Semi IconTextRectangle（convertIcon(text_rectangle, 'text_rectangle')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { textRectangleSvg } from './svgs.js';

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

<Icon svg={textRectangleSvg} type="text_rectangle" {...rest} />
