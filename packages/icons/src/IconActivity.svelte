<!-- IconActivity — 具名图标，对齐 Semi IconActivity（convertIcon(activity, 'activity')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { activitySvg } from './svgs.js';

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

<Icon svg={activitySvg} type="activity" {...rest} />
