<!-- IconCodeStroked — 具名图标，对齐 Semi IconCodeStroked（convertIcon(code_stroked, 'code_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { codeStrokedSvg } from './svgs.js';

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

<Icon svg={codeStrokedSvg} type="code_stroked" {...rest} />
