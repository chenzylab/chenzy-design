<script lang="ts">
  import { Timeline } from '@chenzy-design/svelte';
  import { IconAlertTriangle } from '@chenzy-design/icons';
</script>

<Timeline>
  <Timeline.Item time="2019-07-14 10:35">默认样式的节点</Timeline.Item>
  <Timeline.Item time="2019-06-13 16:17" type="warning">
    {#snippet dot()}<IconAlertTriangle />{/snippet}
    自定义图标
  </Timeline.Item>
  <Timeline.Item time="2019-05-14 18:34" color="pink">自定义节点颜色</Timeline.Item>
  <Timeline.Item time="2019-04-10 12:20">
    <span style="font-size: 18px;">自定义节点样式</span>
  </Timeline.Item>
</Timeline>
