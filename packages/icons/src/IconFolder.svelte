<!-- IconFolder — 具名图标，对齐 Semi IconFolder（convertIcon(folder, 'folder')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { folderSvg } from './svgs.js';

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

<Icon svg={folderSvg} type="folder" {...rest} />
