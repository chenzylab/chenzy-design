<!-- IconDownloadStroked — 具名图标，对齐 Semi IconDownloadStroked（convertIcon(download_stroked, 'download_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { downloadStrokedSvg } from './svgs.js';

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

<Icon svg={downloadStrokedSvg} type="download_stroked" {...rest} />
