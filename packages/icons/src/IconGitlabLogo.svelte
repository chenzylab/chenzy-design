<!-- IconGitlabLogo — 具名图标，对齐 Semi IconGitlabLogo（convertIcon(gitlab_logo, 'gitlab_logo')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { gitlabLogoSvg } from './svgs.js';

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

<Icon svg={gitlabLogoSvg} type="gitlab_logo" {...rest} />
