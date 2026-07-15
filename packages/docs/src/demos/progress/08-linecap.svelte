<script lang="ts">
  import { Progress } from '@chenzy-design/svelte';
</script>

<!-- strokeLinecap 控制环形进度条边缘形状（round 圆角 / square 方角），仅 type=circle 生效 -->
<div style="display: flex; align-items: center; flex-wrap: wrap;">
  <Progress percent={50} strokeLinecap="round" type="circle" style="margin: 10px" aria-label="disk usage" />
  <Progress percent={50} strokeLinecap="square" type="circle" style="margin: 10px" aria-label="disk usage" />
</div>
