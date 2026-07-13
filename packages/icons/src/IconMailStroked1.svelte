<!-- IconMailStroked1 — 具名图标，对齐 Semi IconMailStroked1（convertIcon(mail_stroked_1, 'mail_stroked_1')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { mailStroked1Svg } from './svgs.js';

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

<Icon svg={mailStroked1Svg} type="mail_stroked_1" {...rest} />
