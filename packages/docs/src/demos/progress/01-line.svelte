<script lang="ts">
  import { Progress } from '@chenzy-design/svelte';

  let pct = $state(65);
</script>

<div style="display: flex; flex-direction: column; gap: 8px; max-width: 400px;">
  <input type="range" min="0" max="100" bind:value={pct} aria-label="进度" />
  <Progress percent={pct} ariaLabel="进度条" />
  <Progress percent={pct} status="success" ariaLabel="成功进度" />
  <Progress percent={pct} status="error" ariaLabel="失败进度" />
  <Progress percent={pct} size="small" ariaLabel="小尺寸" />
</div>
