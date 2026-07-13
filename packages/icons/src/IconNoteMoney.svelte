<!-- IconNoteMoney — 具名图标，对齐 Semi IconNoteMoney（convertIcon(note_money, 'note_money')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { noteMoneySvg } from './svgs.js';

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

<Icon svg={noteMoneySvg} type="note_money" {...rest} />
