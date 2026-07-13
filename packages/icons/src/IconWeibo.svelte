<!-- IconWeibo — 具名图标，对齐 Semi IconWeibo（convertIcon(weibo, 'weibo')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { weiboSvg } from './svgs.js';

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

<Icon svg={weiboSvg} type="weibo" {...rest} />
