<!-- IconEdit2 — 具名图标，对齐 Semi IconEdit2（convertIcon(edit_2, 'edit_2')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { edit2Svg } from './svgs.js';

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

<Icon svg={edit2Svg} type="edit_2" {...rest} />
