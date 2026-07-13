<!-- IconEyeOpenedStroked — 具名图标，对齐 Semi IconEyeOpenedStroked（convertIcon(eye_opened_stroked, 'eye_opened_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { eyeOpenedStrokedSvg } from './svgs.js';

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

<Icon svg={eyeOpenedStrokedSvg} type="eye_opened_stroked" {...rest} />
