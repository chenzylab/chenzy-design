<!-- IconInbox — 具名图标，对齐 Semi IconInbox（convertIcon(inbox, 'inbox')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { inboxSvg } from './svgs.js';

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

<Icon svg={inboxSvg} type="inbox" {...rest} />
