<!-- IconCheckboxIndeterminate — 具名图标，对齐 Semi IconCheckboxIndeterminate（convertIcon(checkbox_indeterminate, 'checkbox_indeterminate')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { checkboxIndeterminateSvg } from './svgs.js';

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

<Icon svg={checkboxIndeterminateSvg} type="checkbox_indeterminate" {...rest} />
