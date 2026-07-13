<!-- IconIdCardStroked — 具名图标，对齐 Semi IconIdCardStroked（convertIcon(id_card_stroked, 'id_card_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { idCardStrokedSvg } from './svgs.js';

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

<Icon svg={idCardStrokedSvg} type="id_card_stroked" {...rest} />
