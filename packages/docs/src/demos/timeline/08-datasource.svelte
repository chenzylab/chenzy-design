<script lang="ts">
  import { Timeline, type TimelineItemData } from '@chenzy-design/svelte';
  import { IconAlertTriangle } from '@chenzy-design/icons';

  const dataSource: TimelineItemData[] = [
    { time: '2019-07-14 10:35', extra: '节点辅助说明信息', content: '第一个节点内容', type: 'ongoing' },
    { time: '2019-06-13 16:17', extra: '节点辅助说明信息', content: bigContent, color: 'pink' },
    { time: '2019-05-14 18:34', extra: '节点辅助说明信息', dot: warnDot, content: '第三个节点内容', type: 'warning' },
    { time: '2019-05-09 09:12', extra: '节点辅助说明信息', content: '第四个节点内容', type: 'success' },
  ];
</script>

{#snippet bigContent()}<span style="font-size: 18px;">第二个节点内容</span>{/snippet}
{#snippet warnDot()}<IconAlertTriangle />{/snippet}

<Timeline mode="alternate" {dataSource} />
