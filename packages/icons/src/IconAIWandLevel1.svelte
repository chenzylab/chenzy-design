<!-- IconAIWandLevel1 — 具名图标，对齐 Semi IconAIWandLevel1（convertIcon(ai_wand_level_1, 'ai_wand_level_1')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { aIWandLevel1Svg } from './svgs.js';

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

<Icon svg={aIWandLevel1Svg} type="ai_wand_level_1" {...rest} />
