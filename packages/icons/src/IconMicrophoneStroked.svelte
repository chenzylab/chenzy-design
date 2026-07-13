<!-- IconMicrophoneStroked — 具名图标，对齐 Semi IconMicrophoneStroked（convertIcon(microphone_stroked, 'microphone_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { microphoneStrokedSvg } from './svgs.js';

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

<Icon svg={microphoneStrokedSvg} type="microphone_stroked" {...rest} />
