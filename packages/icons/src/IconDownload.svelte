<!-- IconDownload — 具名图标，对齐 Semi IconDownload（convertIcon(download, 'download')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { downloadSvg } from './svgs.js';

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

<Icon svg={downloadSvg} type="download" {...rest} />
