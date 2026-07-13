<!-- IconMail — 具名图标，对齐 Semi IconMail（convertIcon(mail, 'mail')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { mailSvg } from './svgs.js';

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

<Icon svg={mailSvg} type="mail" {...rest} />
