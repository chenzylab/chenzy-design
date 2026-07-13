<!-- IconPuzzle — 具名图标，对齐 Semi IconPuzzle（convertIcon(puzzle, 'puzzle')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { puzzleSvg } from './svgs.js';

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

<Icon svg={puzzleSvg} type="puzzle" {...rest} />
