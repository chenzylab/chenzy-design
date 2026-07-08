<script lang="ts">
  import { TagInput, Text } from '@chenzy-design/svelte';
</script>

<div style="width: 360px">
  <TagInput
    maxTagTextLength={6}
    showContentTooltip
    defaultValue={['前端工程化实践指南', '设计系统与组件库', 'Svelte 响应式原理']}
    placeholder="输入后回车添加长标签"
  />
  <Text type="tertiary">标签超过 6 个字符即截断，悬浮标签查看全文</Text>
</div>
