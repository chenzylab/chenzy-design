<!-- IconCode — 具名图标，对齐 Semi IconCode（convertIcon(code, 'code')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { codeSvg } from './svgs.js';

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

<Icon svg={codeSvg} type="code" {...rest} />
