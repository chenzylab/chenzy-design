<script lang="ts">
  import { Progress, Button } from '@chenzy-design/svelte';
  import { IconChevronLeft, IconChevronRight } from '@chenzy-design/icons';

  let percent = $state(10);
  const strokeArr = [
    { percent: 20, color: 'red' },
    { percent: 40, color: 'orange-9' },
    { percent: 60, color: 'light-green-8' },
    { percent: 80, color: 'hsla(125, 50%, 46% / 1)' },
  ];
</script>

<div>
  <Progress {percent} stroke={strokeArr} showInfo type="circle" width={100} aria-label="disk usage" />
  <Progress {percent} stroke={strokeArr} showInfo style="margin: 20px 0 10px" aria-label="disk usage" />
</div>
<Button theme="light" disabled={percent === 0} onclick={() => (percent -= 10)}>
  {#snippet icon()}<IconChevronLeft />{/snippet}
</Button>
<Button theme="light" disabled={percent === 100} onclick={() => (percent += 10)}>
  {#snippet icon()}<IconChevronRight />{/snippet}
</Button>
