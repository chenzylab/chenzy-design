<!-- IconExternalOpenStroked — 具名图标，对齐 Semi IconExternalOpenStroked（convertIcon(external_open_stroked, 'external_open_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { externalOpenStrokedSvg } from './svgs.js';

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

<Icon svg={externalOpenStrokedSvg} type="external_open_stroked" {...rest} />
