<!-- IconSimilarity — 具名图标，对齐 Semi IconSimilarity（convertIcon(similarity, 'similarity')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { similaritySvg } from './svgs.js';

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

<Icon svg={similaritySvg} type="similarity" {...rest} />
