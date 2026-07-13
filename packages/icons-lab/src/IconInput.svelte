<!-- IconInput — 具名图标，对齐 Semi IconInput（convertIcon(input, 'input')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { inputSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={inputSvg} type="input" {...rest} />
