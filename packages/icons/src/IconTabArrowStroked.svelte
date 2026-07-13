<!-- IconTabArrowStroked — 具名图标，对齐 Semi IconTabArrowStroked（convertIcon(tab_arrow_stroked, 'tab_arrow_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { tabArrowStrokedSvg } from './svgs.js';

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

<Icon svg={tabArrowStrokedSvg} type="tab_arrow_stroked" {...rest} />
