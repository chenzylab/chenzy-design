<script lang="ts">
  import { Progress } from '@chenzy-design/svelte';
</script>

<!-- 小号环形进度条，默认尺寸 24×24（size="small" 仅 type=circle 生效，不显示中心文本） -->
<div style="display: flex; align-items: center; flex-wrap: wrap;">
  <Progress percent={10} type="circle" size="small" style="margin: 5px" aria-label="disk usage" />
  <Progress percent={25} type="circle" size="small" style="margin: 5px" aria-label="disk usage" />
  <Progress percent={50} type="circle" size="small" style="margin: 5px" aria-label="disk usage" />
  <Progress percent={80} type="circle" size="small" style="margin: 5px" aria-label="disk usage" />
</div>
