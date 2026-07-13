<!-- IconIdCard — 具名图标，对齐 Semi IconIdCard（convertIcon(id_card, 'id_card')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { idCardSvg } from './svgs.js';

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

<Icon svg={idCardSvg} type="id_card" {...rest} />
