<!-- IconEyeOpened — 具名图标，对齐 Semi IconEyeOpened（convertIcon(eye_opened, 'eye_opened')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { eyeOpenedSvg } from './svgs.js';

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

<Icon svg={eyeOpenedSvg} type="eye_opened" {...rest} />
