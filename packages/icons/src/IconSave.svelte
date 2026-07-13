<!-- IconSave — 具名图标，对齐 Semi IconSave（convertIcon(save, 'save')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { saveSvg } from './svgs.js';

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

<Icon svg={saveSvg} type="save" {...rest} />
