<!-- IconRestart — 具名图标，对齐 Semi IconRestart（convertIcon(restart, 'restart')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { restartSvg } from './svgs.js';

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

<Icon svg={restartSvg} type="restart" {...rest} />
