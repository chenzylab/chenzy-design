<!-- IconMale — 具名图标，对齐 Semi IconMale（convertIcon(male, 'male')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { maleSvg } from './svgs.js';

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

<Icon svg={maleSvg} type="male" {...rest} />
