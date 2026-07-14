<script lang="ts">
  import { Timeline } from '@chenzy-design/svelte';

  let last = $state('（未点击）');
</script>

<div style="margin-bottom: 12px; color: var(--cd-color-text-2);">最近点击：{last}</div>
<Timeline>
  <Timeline.Item time="2019-07-14 10:35" type="success" onClick={() => (last = '第一个节点')}>
    创建服务现场
  </Timeline.Item>
  <Timeline.Item time="2019-06-13 16:17" type="ongoing" onClick={() => (last = '第二个节点')}>
    初步排除网络异常
  </Timeline.Item>
  <Timeline.Item time="2019-05-14 18:34" onClick={() => (last = '第三个节点')}>
    技术测试异常
  </Timeline.Item>
</Timeline>
