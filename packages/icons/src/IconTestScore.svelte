<!-- IconTestScore — 具名图标，对齐 Semi IconTestScore（convertIcon(test_score, 'test_score')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { testScoreSvg } from './svgs.js';

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

<Icon svg={testScoreSvg} type="test_score" {...rest} />
