<!-- IconAIImageLevel1 — 具名图标，对齐 Semi IconAIImageLevel1（convertIcon(ai_image_level_1, 'ai_image_level_1')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { aIImageLevel1Svg } from './svgs.js';

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

<Icon svg={aIImageLevel1Svg} type="ai_image_level_1" {...rest} />
