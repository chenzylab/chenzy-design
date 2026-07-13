<!-- IconMailStroked — 具名图标，对齐 Semi IconMailStroked（convertIcon(mail_stroked, 'mail_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { mailStrokedSvg } from './svgs.js';

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

<Icon svg={mailStrokedSvg} type="mail_stroked" {...rest} />
