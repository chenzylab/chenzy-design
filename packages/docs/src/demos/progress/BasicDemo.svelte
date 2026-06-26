<script lang="ts">
  import { Progress } from '@chenzy-design/svelte';

  let progressPct = $state(45);
</script>

<input type="range" min="0" max="100" bind:value={progressPct} style="width:320px; display:block" aria-label="进度" />

<div style="max-width:400px; margin-top:12px; display:flex; flex-direction:column; gap:12px">
  <Progress percent={progressPct} ariaLabel="普通进度" />
  <Progress percent={progressPct} status="success" ariaLabel="成功进度" />
  <Progress percent={progressPct} status="error" ariaLabel="失败进度" />
  <Progress percent={progressPct} size="small" ariaLabel="小尺寸进度" />
</div>

<div style="display:flex; gap:32px; align-items:center; margin-top:16px; flex-wrap:wrap">
  <Progress type="circle" percent={progressPct} ariaLabel="环形进度" />
  <Progress type="circle" percent={100} status="success" successWhenFull ariaLabel="完成环形" />
  <Progress type="dashboard" percent={progressPct} ariaLabel="仪表盘进度" />
  <Progress type="line" indeterminate ariaLabel="不确定进度" />
</div>
