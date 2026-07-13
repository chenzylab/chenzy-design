<!-- IconAIBellLevel1 — 具名图标，对齐 Semi IconAIBellLevel1（convertIcon(ai_bell_level_1, 'ai_bell_level_1')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { aIBellLevel1Svg } from './svgs.js';

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

<Icon svg={aIBellLevel1Svg} type="ai_bell_level_1" {...rest} />
