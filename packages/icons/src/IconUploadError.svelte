<!-- IconUploadError — 具名图标，对齐 Semi IconUploadError（convertIcon(upload_error, 'upload_error')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { uploadErrorSvg } from './svgs.js';

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

<Icon svg={uploadErrorSvg} type="upload_error" {...rest} />
