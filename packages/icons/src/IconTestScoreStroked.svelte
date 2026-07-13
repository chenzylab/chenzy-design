<!-- IconTestScoreStroked — 具名图标，对齐 Semi IconTestScoreStroked（convertIcon(test_score_stroked, 'test_score_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { testScoreStrokedSvg } from './svgs.js';

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

<Icon svg={testScoreStrokedSvg} type="test_score_stroked" {...rest} />
