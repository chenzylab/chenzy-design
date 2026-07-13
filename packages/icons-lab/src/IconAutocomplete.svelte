<!-- IconAutocomplete — 具名图标，对齐 Semi IconAutocomplete（convertIcon(autocomplete, 'autocomplete')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { autocompleteSvg } from './svgs.js';

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

<Icon svg={autocompleteSvg} type="autocomplete" {...rest} />
