<!-- IconTicketCodeStroked — 具名图标，对齐 Semi IconTicketCodeStroked（convertIcon(ticket_code_stroked, 'ticket_code_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { ticketCodeStrokedSvg } from './svgs.js';

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

<Icon svg={ticketCodeStrokedSvg} type="ticket_code_stroked" {...rest} />
