<!-- IconImage — 具名图标，对齐 Semi IconImage（convertIcon(image, 'image')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { imageSvg } from './svgs.js';

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

<Icon svg={imageSvg} type="image" {...rest} />
