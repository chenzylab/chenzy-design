<!-- IconCameraStroked — 具名图标，对齐 Semi IconCameraStroked（convertIcon(camera_stroked, 'camera_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { cameraStrokedSvg } from './svgs.js';

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

<Icon svg={cameraStrokedSvg} type="camera_stroked" {...rest} />
