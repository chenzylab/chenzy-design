<!-- IconFile — 具名图标，对齐 Semi IconFile（convertIcon(file, 'file')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { fileSvg } from './svgs.js';

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

<Icon svg={fileSvg} type="file" {...rest} />
