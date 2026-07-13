<!-- IconDatePicker — 具名图标，对齐 Semi IconDatePicker（convertIcon(date-picker, 'date-picker')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { datePickerSvg } from './svgs.js';

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

<Icon svg={datePickerSvg} type="date-picker" {...rest} />
