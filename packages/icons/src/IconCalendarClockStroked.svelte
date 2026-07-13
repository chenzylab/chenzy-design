<!-- IconCalendarClockStroked — 具名图标，对齐 Semi IconCalendarClockStroked（convertIcon(calendar_clock_stroked, 'calendar_clock_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { calendarClockStrokedSvg } from './svgs.js';

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

<Icon svg={calendarClockStrokedSvg} type="calendar_clock_stroked" {...rest} />
