<!-- IconBriefcaseStroked — 具名图标，对齐 Semi IconBriefcaseStroked（convertIcon(briefcase_stroked, 'briefcase_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { briefcaseStrokedSvg } from './svgs.js';

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

<Icon svg={briefcaseStrokedSvg} type="briefcase_stroked" {...rest} />
