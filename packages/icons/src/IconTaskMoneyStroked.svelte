<!-- IconTaskMoneyStroked — 具名图标，对齐 Semi IconTaskMoneyStroked（convertIcon(task_money_stroked, 'task_money_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { taskMoneyStrokedSvg } from './svgs.js';

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

<Icon svg={taskMoneyStrokedSvg} type="task_money_stroked" {...rest} />
