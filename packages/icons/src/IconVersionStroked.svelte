<!-- IconVersionStroked — 具名图标，对齐 Semi IconVersionStroked（convertIcon(version_stroked, 'version_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { versionStrokedSvg } from './svgs.js';

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

<Icon svg={versionStrokedSvg} type="version_stroked" {...rest} />
