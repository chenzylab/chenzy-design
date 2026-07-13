<!-- IconUpload — 具名图标，对齐 Semi IconUpload（convertIcon(upload, 'upload')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { uploadSvg } from './svgs.js';

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

<Icon svg={uploadSvg} type="upload" {...rest} />
