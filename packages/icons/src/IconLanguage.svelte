<!-- IconLanguage — 具名图标，对齐 Semi IconLanguage（convertIcon(language, 'language')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { languageSvg } from './svgs.js';

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

<Icon svg={languageSvg} type="language" {...rest} />
