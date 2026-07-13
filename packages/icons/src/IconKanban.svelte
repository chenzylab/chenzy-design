<!-- IconKanban — 具名图标，对齐 Semi IconKanban（convertIcon(kanban, 'kanban')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { kanbanSvg } from './svgs.js';

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

<Icon svg={kanbanSvg} type="kanban" {...rest} />
