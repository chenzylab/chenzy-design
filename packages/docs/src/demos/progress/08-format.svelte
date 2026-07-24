<script lang="ts">
  import { Progress } from '@chenzy-design/svelte';
</script>

<!-- format 自定义中心文字，入参为当前百分比；不需要文本可 showInfo={false} 或 format 返回空串 -->
<div style="display: flex; align-items: center; flex-wrap: wrap;">
  <Progress percent={75} showInfo type="circle" format={(per) => per + 'Days'} style="margin: 10px" aria-label="disk usage" />
  <Progress percent={100} showInfo type="circle" format={() => 'Done'} style="margin: 10px" aria-label="disk usage" />
  <Progress percent={50} type="circle" showInfo={false} style="margin: 10px" aria-label="disk usage" />
</div>
