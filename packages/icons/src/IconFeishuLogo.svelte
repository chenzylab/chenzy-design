<!-- IconFeishuLogo — 具名图标，对齐 Semi IconFeishuLogo（convertIcon(feishu_logo, 'feishu_logo')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { feishuLogoSvg } from './svgs.js';

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

<Icon svg={feishuLogoSvg} type="feishu_logo" {...rest} />
