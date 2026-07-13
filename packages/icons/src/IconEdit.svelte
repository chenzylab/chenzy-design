<!-- IconEdit — 具名图标，对齐 Semi IconEdit（convertIcon(edit, 'edit')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { editSvg } from './svgs.js';

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

<Icon svg={editSvg} type="edit" {...rest} />
