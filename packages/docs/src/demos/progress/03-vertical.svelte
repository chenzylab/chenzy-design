<script lang="ts">
  import { Progress } from '@chenzy-design/svelte';
</script>

<!-- direction="vertical" 展示垂直进度条，可通过 style 传入 width 控制宽度 -->
<div style="height: 100px; display: flex; gap: 8px;">
  <Progress percent={10} direction="vertical" aria-label="disk usage" />
  <Progress percent={25} direction="vertical" aria-label="disk usage" />
  <Progress percent={50} direction="vertical" aria-label="disk usage" />
  <Progress percent={80} direction="vertical" size="large" aria-label="disk usage" />
  <Progress percent={80} direction="vertical" style="width: 8px" aria-label="disk usage" />
</div>
