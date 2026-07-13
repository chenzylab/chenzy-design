<!-- IconCheckbox — 具名图标，对齐 Semi IconCheckbox（convertIcon(checkbox, 'checkbox')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { checkboxSvg } from './svgs.js';

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

<Icon svg={checkboxSvg} type="checkbox" {...rest} />
