<!-- IconTicketCode — 具名图标，对齐 Semi IconTicketCode（convertIcon(ticket_code, 'ticket_code')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { ticketCodeSvg } from './svgs.js';

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

<Icon svg={ticketCodeSvg} type="ticket_code" {...rest} />
