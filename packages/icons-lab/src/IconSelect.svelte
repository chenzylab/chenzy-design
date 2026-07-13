<!-- IconSelect — 具名图标，对齐 Semi IconSelect（convertIcon(select, 'select')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { selectSvg } from './svgs.js';

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

<Icon svg={selectSvg} type="select" {...rest} />
