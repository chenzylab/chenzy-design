<!-- IconHome — 具名图标，对齐 Semi IconHome（convertIcon(home, 'home')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { homeSvg } from './svgs.js';

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

<Icon svg={homeSvg} type="home" {...rest} />
