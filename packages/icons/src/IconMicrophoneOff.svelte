<!-- IconMicrophoneOff — 具名图标，对齐 Semi IconMicrophoneOff（convertIcon(microphone_off, 'microphone_off')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { microphoneOffSvg } from './svgs.js';

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

<Icon svg={microphoneOffSvg} type="microphone_off" {...rest} />
