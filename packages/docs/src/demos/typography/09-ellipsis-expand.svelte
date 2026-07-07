<script lang="ts">
  import { Paragraph } from '@chenzy-design/svelte';
</script>

<div style="width: 300px;">
  <Paragraph ellipsis={{ rows: 2, expandable: true, collapsible: true }}>
    这是一段支持展开与收起的长文本。默认只显示两行，末尾提供「展开」按钮；
    点击展开后可查看完整内容，同时提供「收起」按钮恢复折叠状态。
    chenzy-design 的 Typography 组件对齐 Semi Design，让长文本在有限空间内保持整洁，
    又能按需查看全部信息，兼顾了信息密度与阅读体验的平衡。
  </Paragraph>
</div>
