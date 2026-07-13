<!-- IconFolderOpenStroked — 具名图标，对齐 Semi IconFolderOpenStroked（convertIcon(folder_open_stroked, 'folder_open_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { folderOpenStrokedSvg } from './svgs.js';

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

<Icon svg={folderOpenStrokedSvg} type="folder_open_stroked" {...rest} />
