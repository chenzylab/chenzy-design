<!-- IconIdentity — 具名图标，对齐 Semi IconIdentity（convertIcon(identity, 'identity')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { identitySvg } from './svgs.js';

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

<Icon svg={identitySvg} type="identity" {...rest} />
