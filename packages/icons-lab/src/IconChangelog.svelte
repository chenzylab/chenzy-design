<!-- IconChangelog — 具名图标，对齐 Semi IconChangelog（convertIcon(changelog, 'changelog')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { changelogSvg } from './svgs.js';

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

<Icon svg={changelogSvg} type="changelog" {...rest} />
