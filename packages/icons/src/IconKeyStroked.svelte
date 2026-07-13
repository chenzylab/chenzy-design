<!-- IconKeyStroked — 具名图标，对齐 Semi IconKeyStroked（convertIcon(key_stroked, 'key_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { keyStrokedSvg } from './svgs.js';

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

<Icon svg={keyStrokedSvg} type="key_stroked" {...rest} />
