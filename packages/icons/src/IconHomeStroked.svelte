<!-- IconHomeStroked — 具名图标，对齐 Semi IconHomeStroked（convertIcon(home_stroked, 'home_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { homeStrokedSvg } from './svgs.js';

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

<Icon svg={homeStrokedSvg} type="home_stroked" {...rest} />
