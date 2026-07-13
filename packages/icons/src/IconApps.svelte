<!-- IconApps — 具名图标，对齐 Semi IconApps（convertIcon(apps, 'apps')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { appsSvg } from './svgs.js';

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

<Icon svg={appsSvg} type="apps" {...rest} />
