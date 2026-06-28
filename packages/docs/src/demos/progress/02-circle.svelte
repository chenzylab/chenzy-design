<script lang="ts">
  import { Progress } from '@chenzy-design/svelte';

  let pct = $state(75);
</script>

<div style="display: flex; flex-direction: column; gap: 8px;">
  <input type="range" min="0" max="100" bind:value={pct} aria-label="进度" />
  <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
    <Progress type="circle" percent={pct} ariaLabel="环形进度" />
    <Progress type="circle" percent={100} status="success" successWhenFull ariaLabel="完成" />
    <Progress type="dashboard" percent={pct} ariaLabel="仪表盘进度" />
  </div>
</div>
