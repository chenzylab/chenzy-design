<script lang="ts">
  import { Timeline } from '@chenzy-design/svelte';
</script>

<Timeline>
  <Timeline.Item type="success" time="2024-06-01">项目立项，目标明确</Timeline.Item>
  <Timeline.Item type="ongoing" time="2024-06-15">开发阶段，进行中</Timeline.Item>
  <Timeline.Item type="warning" time="2024-06-28">测试阶段，发现若干问题</Timeline.Item>
  <Timeline.Item type="error" time="2024-07-01">上线受阻，需紧急修复</Timeline.Item>
  <Timeline.Item type="default" time="2024-07-05">待处理</Timeline.Item>
</Timeline>
