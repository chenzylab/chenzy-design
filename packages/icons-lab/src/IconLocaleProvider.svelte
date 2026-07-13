<!-- IconLocaleProvider — 具名图标，对齐 Semi IconLocaleProvider（convertIcon(locale-provider, 'locale-provider')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { localeProviderSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={localeProviderSvg} type="locale-provider" {...rest} />
