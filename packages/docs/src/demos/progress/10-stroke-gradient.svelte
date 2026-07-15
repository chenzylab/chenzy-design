<script lang="ts">
  import { Progress, Button } from '@chenzy-design/svelte';

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

<!-- strokeGradient=true 时自动补齐颜色区间生成渐变（需 stroke 至少一个区间数组） -->
<div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
  <Progress {percent} stroke={strokeArr} strokeGradient showInfo type="circle" width={100} aria-label="file download speed" />
  <Progress {percent} stroke={strokeArrReverse} strokeGradient showInfo type="circle" width={100} aria-label="file download speed" />
</div>

<div style="width: 100%; margin: 20px 0 10px;">
  <Progress {percent} stroke={strokeArr} strokeGradient showInfo size="large" aria-label="file download speed" />
</div>

<div style="display: flex; gap: 8px;">
  <Button theme="light" disabled={percent === 0} onclick={() => (percent -= 5)}>−5</Button>
  <Button theme="light" disabled={percent === 100} onclick={() => (percent += 5)}>+5</Button>
</div>
