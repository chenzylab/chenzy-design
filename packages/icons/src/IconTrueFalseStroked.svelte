<!-- IconTrueFalseStroked — 具名图标，对齐 Semi IconTrueFalseStroked（convertIcon(true_false_stroked, 'true_false_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { trueFalseStrokedSvg } from './svgs.js';

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

<Icon svg={trueFalseStrokedSvg} type="true_false_stroked" {...rest} />
