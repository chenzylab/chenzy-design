<!-- IconGithubLogo — 具名图标，对齐 Semi IconGithubLogo（convertIcon(github_logo, 'github_logo')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { githubLogoSvg } from './svgs.js';

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

<Icon svg={githubLogoSvg} type="github_logo" {...rest} />
