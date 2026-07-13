<!-- IconNoteMoneyStroked — 具名图标，对齐 Semi IconNoteMoneyStroked（convertIcon(note_money_stroked, 'note_money_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { noteMoneyStrokedSvg } from './svgs.js';

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

<Icon svg={noteMoneyStrokedSvg} type="note_money_stroked" {...rest} />
