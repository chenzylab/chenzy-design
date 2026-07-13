<!-- IconCalendarClock — 具名图标，对齐 Semi IconCalendarClock（convertIcon(calendar_clock, 'calendar_clock')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { calendarClockSvg } from './svgs.js';

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

<Icon svg={calendarClockSvg} type="calendar_clock" {...rest} />
