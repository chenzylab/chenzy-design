<!-- IconCaretdown — 具名图标，对齐 Semi IconCaretdown（convertIcon(caretdown, 'caretdown')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { caretdownSvg } from './svgs.js';

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

<Icon svg={caretdownSvg} type="caretdown" {...rest} />
