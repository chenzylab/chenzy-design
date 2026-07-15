<script lang="ts">
  import { Progress, Button } from '@chenzy-design/svelte';

  let percent = $state(40);
  let cirPerc = $state(40);
</script>

<div style="display: flex; flex-direction: column; gap: 20px;">
  <div>
    <Progress {percent} showInfo aria-label="disk usage" />
    <div style="display: flex; gap: 8px; margin-top: 8px;">
      <Button theme="light" disabled={percent === 0} onclick={() => (percent -= 10)}>−10</Button>
      <Button theme="light" disabled={percent >= 100} onclick={() => (percent += 10)}>+10</Button>
    </div>
  </div>

  <div>
    <Progress percent={cirPerc} type="circle" showInfo aria-label="disk usage" />
    <div style="display: flex; gap: 8px; margin-top: 8px;">
      <Button theme="light" disabled={cirPerc === 0} onclick={() => (cirPerc -= 10)}>−10</Button>
      <Button theme="light" disabled={cirPerc >= 100} onclick={() => (cirPerc += 10)}>+10</Button>
    </div>
  </div>
</div>
