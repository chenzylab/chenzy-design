<!-- IconCheckChoiceStroked — 具名图标，对齐 Semi IconCheckChoiceStroked（convertIcon(check_choice_stroked, 'check_choice_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { checkChoiceStrokedSvg } from './svgs.js';

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

<Icon svg={checkChoiceStrokedSvg} type="check_choice_stroked" {...rest} />
