<!-- IconAIFileLevel1 — 具名图标，对齐 Semi IconAIFileLevel1（convertIcon(ai_file_level_1, 'ai_file_level_1')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { aIFileLevel1Svg } from './svgs.js';

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

<Icon svg={aIFileLevel1Svg} type="ai_file_level_1" {...rest} />
