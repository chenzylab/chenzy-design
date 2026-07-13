<!-- IconGit — 具名图标，对齐 Semi IconGit（convertIcon(git, 'git')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { gitSvg } from './svgs.js';

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

<Icon svg={gitSvg} type="git" {...rest} />
