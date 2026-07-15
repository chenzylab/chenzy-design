<script lang="ts">
  import { Progress, Button } from '@chenzy-design/svelte';

  let percent = $state(10);
  const strokeArr = [
    { percent: 20, color: 'red' },
    { percent: 40, color: 'orange-9' },
    { percent: 60, color: 'light-green-8' },
    { percent: 80, color: 'hsla(125, 50%, 46% / 1)' },
  ];
</script>

<!-- stroke 传入 Array<{percent, color}>，按当前 percent 落入的区间取色（支持 Hex/Hsl/Rgb/Design Token） -->
<div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap;">
  <Progress {percent} stroke={strokeArr} showInfo type="circle" width={100} aria-label="disk usage" />
  <div style="flex: 1; min-width: 160px;">
    <Progress {percent} stroke={strokeArr} showInfo aria-label="disk usage" />
  </div>
</div>

<div style="display: flex; gap: 8px; margin-top: 16px;">
  <Button theme="light" disabled={percent === 0} onclick={() => (percent -= 10)}>−10</Button>
  <Button theme="light" disabled={percent === 100} onclick={() => (percent += 10)}>+10</Button>
</div>
