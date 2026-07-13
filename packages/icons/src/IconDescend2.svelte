<!-- IconDescend2 — 具名图标，对齐 Semi IconDescend2（convertIcon(descend2, 'descend2')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { descend2Svg } from './svgs.js';

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

<Icon svg={descend2Svg} type="descend2" {...rest} />
