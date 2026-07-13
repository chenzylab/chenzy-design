<!-- IconCalendarStroked — 具名图标，对齐 Semi IconCalendarStroked（convertIcon(calendar_stroked, 'calendar_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { calendarStrokedSvg } from './svgs.js';

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

<Icon svg={calendarStrokedSvg} type="calendar_stroked" {...rest} />
