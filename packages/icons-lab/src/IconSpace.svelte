<!-- IconSpace — 具名图标，对齐 Semi IconSpace（convertIcon(space, 'space')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { spaceSvg } from './svgs.js';

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

<Icon svg={spaceSvg} type="space" {...rest} />
