<script lang="ts">
  import { TagInput, Text } from '@chenzy-design/svelte';
</script>

<div style="width: 320px">
  <!-- 标签文本过长时单行省略，showContentTooltip 悬浮标签显示全文（对齐 Semi） -->
  <TagInput
    showContentTooltip
    defaultValue={['前端工程化实践指南', '设计系统与组件库建设', 'Svelte 响应式原理']}
    placeholder="输入后回车添加长标签"
  />
  <Text type="tertiary">长标签省略，悬浮标签查看全文</Text>
</div>
