<!--
  Steps — 严格对齐 Semi index.tsx：纯分发器，按 type 渲染 FillSteps/BasicSteps/NavSteps 之一。
  用法：<Steps type=.. current=.. onChange=..><Steps.Step title=.. /> …</Steps>（对齐 Semi）。
  三型字段集合不同（对齐 Semi FillStepsProps/BasicStepsProps/NavStepsProps）：
    fill  — 无 size；basic — 完整字段（含 hasLine）；nav — 无 direction/status。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import BasicSteps from './BasicSteps.svelte';
  import FillSteps from './FillSteps.svelte';
  import NavSteps from './NavSteps.svelte';
  import type { StepsType, StepsSize, StepsDirection } from './context.js';
  import type { StepStatus } from './types.js';

  interface Props {
    current?: number;
    direction?: StepsDirection;
    type?: StepsType;
    status?: StepStatus;
    size?: StepsSize;
    initial?: number;
    hasLine?: boolean;
    onChange?: (current: number) => void;
    class?: string;
    style?: string;
    'aria-label'?: string;
    children?: Snippet;
  }

  let { type = 'fill', ...rest }: Props = $props();
</script>

{#if type === 'fill'}
  <FillSteps
    current={rest.current}
    initial={rest.initial}
    status={rest.status}
    direction={rest.direction}
    onChange={rest.onChange}
    class={rest.class}
    style={rest.style}
    aria-label={rest['aria-label']}
    children={rest.children}
  />
{:else if type === 'basic'}
  <BasicSteps
    current={rest.current}
    initial={rest.initial}
    status={rest.status}
    size={rest.size}
    direction={rest.direction}
    hasLine={rest.hasLine}
    onChange={rest.onChange}
    class={rest.class}
    style={rest.style}
    aria-label={rest['aria-label']}
    children={rest.children}
  />
{:else if type === 'nav'}
  <NavSteps
    current={rest.current}
    initial={rest.initial}
    size={rest.size}
    onChange={rest.onChange}
    class={rest.class}
    style={rest.style}
    aria-label={rest['aria-label']}
    children={rest.children}
  />
{/if}
