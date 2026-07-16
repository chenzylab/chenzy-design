<script lang="ts">
  import { Steps, Button } from '@chenzy-design/svelte';

  const steps = [
    { title: 'First', content: 'First-content' },
    { title: 'Second', content: 'Second-content' },
    { title: 'Last', content: 'Last-content' },
  ];
  let current = $state(0);

  const next = () => (current += 1);
  const prev = () => (current -= 1);
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <Steps type="basic" {current}>
    {#each steps as step (step.title)}
      <Steps.Step title={step.title} />
    {/each}
  </Steps>
  <div style="margin: 4px 0;">{steps[current].content}</div>
  <div style="display: flex; gap: 8px;">
    {#if current < steps.length - 1}
      <Button type="primary" onclick={next}>Next</Button>
    {/if}
    {#if current === steps.length - 1}
      <Button type="primary" onclick={() => console.log('Processing complete!')}>Done</Button>
    {/if}
    {#if current > 0}
      <Button onclick={prev}>Previous</Button>
    {/if}
  </div>
</div>
