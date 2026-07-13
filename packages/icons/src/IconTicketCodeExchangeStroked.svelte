<!-- IconTicketCodeExchangeStroked — 具名图标，对齐 Semi IconTicketCodeExchangeStroked（convertIcon(ticket_code_exchange_stroked, 'ticket_code_exchange_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { ticketCodeExchangeStrokedSvg } from './svgs.js';

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

<Icon svg={ticketCodeExchangeStrokedSvg} type="ticket_code_exchange_stroked" {...rest} />
