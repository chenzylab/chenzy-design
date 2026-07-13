<!-- IconExternalOpen — 具名图标，对齐 Semi IconExternalOpen（convertIcon(external_open, 'external_open')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { externalOpenSvg } from './svgs.js';

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

<Icon svg={externalOpenSvg} type="external_open" {...rest} />
