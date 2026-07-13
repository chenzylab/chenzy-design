<!-- IconIntro — 具名图标，对齐 Semi IconIntro（convertIcon(intro, 'intro')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { introSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={introSvg} type="intro" {...rest} />
