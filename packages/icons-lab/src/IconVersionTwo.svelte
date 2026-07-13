<!-- IconVersionTwo — 具名图标，对齐 Semi IconVersionTwo（convertIcon(version-two, 'version-two')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { versionTwoSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={versionTwoSvg} type="version-two" {...rest} />
