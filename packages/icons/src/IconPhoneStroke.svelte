<!-- IconPhoneStroke — 具名图标，对齐 Semi IconPhoneStroke（convertIcon(phone_stroke, 'phone_stroke')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { phoneStrokeSvg } from './svgs.js';

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

<Icon svg={phoneStrokeSvg} type="phone_stroke" {...rest} />
