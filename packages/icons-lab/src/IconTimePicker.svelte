<!-- IconTimePicker — 具名图标，对齐 Semi IconTimePicker（convertIcon(time-picker, 'time-picker')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { timePickerSvg } from './svgs.js';

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

<Icon svg={timePickerSvg} type="time-picker" {...rest} />
