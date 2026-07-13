<!-- IconUserCardPhone — 具名图标，对齐 Semi IconUserCardPhone（convertIcon(user_card_phone, 'user_card_phone')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { userCardPhoneSvg } from './svgs.js';

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

<Icon svg={userCardPhoneSvg} type="user_card_phone" {...rest} />
