<!-- IconTabsStroked — 具名图标，对齐 Semi IconTabsStroked（convertIcon(tabs_stroked, 'tabs_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { tabsStrokedSvg } from './svgs.js';

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

<Icon svg={tabsStrokedSvg} type="tabs_stroked" {...rest} />
