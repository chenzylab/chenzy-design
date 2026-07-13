<!-- IconComponent — 具名图标，对齐 Semi IconComponent（convertIcon(component, 'component')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { componentSvg } from './svgs.js';

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

<Icon svg={componentSvg} type="component" {...rest} />
