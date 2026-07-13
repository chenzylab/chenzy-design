<!-- IconPhone — 具名图标，对齐 Semi IconPhone（convertIcon(phone, 'phone')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { phoneSvg } from './svgs.js';

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

<Icon svg={phoneSvg} type="phone" {...rest} />
