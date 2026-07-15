<script lang="ts">
  import { Progress } from '@chenzy-design/svelte';
</script>

<!-- showInfo 控制是否展示百分比数字，format 可格式化展示文本 -->
<div style="width: 200px; display: flex; flex-direction: column; gap: 12px;">
  <Progress percent={10} stroke="var(--cd-color-warning)" showInfo aria-label="disk usage" />
  <Progress percent={25} stroke="var(--cd-color-danger)" showInfo aria-label="disk usage" />
  <Progress percent={50} showInfo aria-label="disk usage" />
  <Progress percent={50} showInfo format={(percent) => percent * 10 + '‰'} aria-label="disk usage" />
</div>
