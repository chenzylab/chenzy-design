<!-- IconFolderOpen — 具名图标，对齐 Semi IconFolderOpen（convertIcon(folder_open, 'folder_open')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { folderOpenSvg } from './svgs.js';

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

<Icon svg={folderOpenSvg} type="folder_open" {...rest} />
