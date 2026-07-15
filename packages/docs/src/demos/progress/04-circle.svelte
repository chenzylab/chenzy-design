<script lang="ts">
  import { Progress } from '@chenzy-design/svelte';
</script>

<!-- type="circle" 展示环形进度条，默认尺寸 72×72 -->
<div style="display: flex; align-items: center; flex-wrap: wrap;">
  <Progress percent={10} type="circle" style="margin: 5px" aria-label="disk usage" />
  <Progress percent={25} type="circle" style="margin: 5px" aria-label="disk usage" />
  <Progress percent={50} type="circle" style="margin: 5px" aria-label="disk usage" />
  <Progress percent={80} type="circle" style="margin: 5px" aria-label="disk usage" />
</div>

<!-- 通过 width 控制环形进度条大小 -->
<div style="display: flex; align-items: center; gap: 8px; margin-top: 12px;">
  <Progress percent={100} type="circle" width={100} style="margin: 5px" aria-label="disk usage" />
  <Progress
    percent={100}
    type="circle"
    width={100}
    style="margin: 5px"
    stroke="var(--cd-color-danger)"
    aria-label="disk usage"
  />
</div>
