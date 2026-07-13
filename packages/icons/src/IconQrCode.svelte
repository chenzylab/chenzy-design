<!-- IconQrCode — 具名图标，对齐 Semi IconQrCode（convertIcon(qr_code, 'qr_code')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { qrCodeSvg } from './svgs.js';

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

<Icon svg={qrCodeSvg} type="qr_code" {...rest} />
