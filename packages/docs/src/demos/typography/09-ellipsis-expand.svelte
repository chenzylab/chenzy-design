<script lang="ts">
  import { Paragraph, Text } from '@chenzy-design/svelte';

  let expandCount = $state(0);
</script>

<div style="display: flex; flex-direction: column; gap: 12px; width: 300px;">
  <Paragraph ellipsis={{ rows: 2, expandable: true, collapsible: true }}>
    这是一段支持展开与收起的长文本。默认只显示两行，末尾提供「展开」按钮；
    点击展开后可查看完整内容，同时提供「收起」按钮恢复折叠状态。
    chenzy-design 的 Typography 组件对齐 Semi Design，让长文本在有限空间内保持整洁，
    又能按需查看全部信息，兼顾了信息密度与阅读体验的平衡。
  </Paragraph>

  <Paragraph
    ellipsis={{
      rows: 2,
      expandable: true,
      collapsible: true,
      expandText: '查看更多',
      collapseText: '收起全文',
      onExpand: (e) => {
        if (e) expandCount += 1;
      },
    }}
  >
    这是一段自定义展开/收起文案的长文本，展开按钮显示「查看更多」、收起按钮显示「收起全文」，
    并通过 onExpand 回调统计展开次数。chenzy-design 的 Typography 支持完全自定义交互文案与事件回调，
    满足不同产品的文案规范与埋点需求。
  </Paragraph>
  <Text type="tertiary" size="small">已展开 {expandCount} 次</Text>
</div>
