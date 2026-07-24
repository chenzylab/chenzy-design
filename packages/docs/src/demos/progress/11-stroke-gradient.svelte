<script lang="ts">
  import { Space, Progress, Button } from '@chenzy-design/svelte';
  import { IconChevronLeft, IconChevronRight } from '@chenzy-design/icons';

  let percent = $state(65);
  const strokeArr = [
    { percent: 0, color: 'rgb(249, 57, 32)' },
    { percent: 50, color: '#46259E' },
    { percent: 100, color: 'hsla(125, 50%, 46% / 1)' },
  ];
  const strokeArrReverse = [
    { percent: 0, color: 'hsla(125, 50%, 46% / 1)' },
    { percent: 50, color: '#46259E' },
    { percent: 100, color: 'rgb(249, 57, 32)' },
  ];
</script>

<Space spacing={20}>
  <div>
    <Progress {percent} stroke={strokeArr} strokeGradient showInfo type="circle" width={100} aria-label="file download speed" />
  </div>
  <div>
    <Progress {percent} stroke={strokeArrReverse} strokeGradient showInfo type="circle" width={100} aria-label="file download speed" />
  </div>
</Space>
<div style="width: 100%; margin: 20px 0 10px;">
  <Progress {percent} stroke={strokeArr} strokeGradient showInfo size="large" aria-label="file download speed" />
</div>
<Button theme="light" disabled={percent === 0} onclick={() => (percent -= 5)}>
  {#snippet icon()}<IconChevronLeft />{/snippet}
</Button>
<Button theme="light" disabled={percent === 100} onclick={() => (percent += 5)}>
  {#snippet icon()}<IconChevronRight />{/snippet}
</Button>
