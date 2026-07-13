<!-- IconCloudUploadStroked — 具名图标，对齐 Semi IconCloudUploadStroked（convertIcon(cloud_upload_stroked, 'cloud_upload_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { cloudUploadStrokedSvg } from './svgs.js';

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

<Icon svg={cloudUploadStrokedSvg} type="cloud_upload_stroked" {...rest} />
