<!-- IconJsonViewer — 具名图标，对齐 Semi IconJsonViewer（convertIcon(json-viewer, 'json-viewer')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { jsonViewerSvg } from './svgs.js';

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

<Icon svg={jsonViewerSvg} type="json-viewer" {...rest} />
