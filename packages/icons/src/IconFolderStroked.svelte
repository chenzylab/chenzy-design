<!-- IconFolderStroked — 具名图标，对齐 Semi IconFolderStroked（convertIcon(folder_stroked, 'folder_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { folderStrokedSvg } from './svgs.js';

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

<Icon svg={folderStrokedSvg} type="folder_stroked" {...rest} />
