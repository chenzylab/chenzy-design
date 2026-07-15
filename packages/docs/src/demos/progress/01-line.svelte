<script lang="ts">
  import { Progress } from '@chenzy-design/svelte';
</script>

<!-- 通过 stroke 控制填充色，percent 控制进度，size 控制尺寸，
     size 不满足时可用 style 传入 height 自定义高度 -->
<div style="width: 200px; display: flex; flex-direction: column; gap: 12px;">
  <Progress percent={10} stroke="var(--cd-color-warning)" aria-label="disk usage" />
  <Progress percent={25} stroke="var(--cd-color-danger)" aria-label="disk usage" />
  <Progress percent={50} aria-label="disk usage" />
  <Progress percent={80} aria-label="download progress" />
  <Progress percent={80} size="large" aria-label="disk usage" />
  <Progress percent={80} style="height: 8px" aria-label="disk usage" />
</div>
