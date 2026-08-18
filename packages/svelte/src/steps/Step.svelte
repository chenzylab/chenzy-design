<!--
  Step — 严格对齐 Semi step.tsx：纯分发器，按父 <Steps> 的 type 渲染
  BasicStep/FillStep/NavStep 之一。type 经 context 传递（对齐 Semi useContext(Context)）。
-->
<script lang="ts">
  import BasicStep from './BasicStep.svelte';
  import FillStep from './FillStep.svelte';
  import NavStep from './NavStep.svelte';
  import { getStepsContext } from './context.js';
  import type { StepProps } from './types.js';

  let props: StepProps = $props();

  const ctx = getStepsContext();
  const type = $derived(ctx?.getType() ?? 'fill');
</script>

{#if type === 'fill'}
  <FillStep {...props} />
{:else if type === 'basic'}
  <BasicStep {...props} />
{:else if type === 'nav'}
  <NavStep {...props} />
{/if}
