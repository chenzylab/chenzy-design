<!-- IconBreadcrumb — 具名图标，对齐 Semi IconBreadcrumb（convertIcon(breadcrumb, 'breadcrumb')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { breadcrumbSvg } from './svgs.js';

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

<Icon svg={breadcrumbSvg} type="breadcrumb" {...rest} />
