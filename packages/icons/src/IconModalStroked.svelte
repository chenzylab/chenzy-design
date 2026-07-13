<!-- IconModalStroked — 具名图标，对齐 Semi IconModalStroked（convertIcon(modal_stroked, 'modal_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { modalStrokedSvg } from './svgs.js';

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

<Icon svg={modalStrokedSvg} type="modal_stroked" {...rest} />
