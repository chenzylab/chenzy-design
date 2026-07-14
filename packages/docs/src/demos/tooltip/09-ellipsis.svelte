<script lang="ts">
  import { Typography } from '@chenzy-design/svelte';

  const { Paragraph, Title, Text } = Typography;
</script>

<!-- 仅当内容宽度超出时展示 Tooltip：用 Typography 的 ellipsis.showTooltip，
     无需自己对 Tooltip 出现做条件判断（对齐 Semi 推荐做法）。宽度由外层容器约束。 -->
<div style="display: flex; flex-direction: column; gap: 12px;">
  <div style="width: 250px;">
    <Title heading={5} ellipsis={{ showTooltip: true }}>
      是一个很长很长很长很长 5 号标题
    </Title>
  </div>
  <div style="width: 150px;">
    <Text ellipsis={{ showTooltip: true }}>
      是一个很长很长很长很长的文本
    </Text>
  </div>
  <div style="width: 300px;">
    <Paragraph ellipsis={{ rows: 3, showTooltip: true }}>
      多行截断，超出展示 Tooltip：chenzy-design 是一套严格对齐 Semi Design
      的 Svelte 组件库，包含设计语言与一整套可复用的前端组件，帮助设计师与开发者更容易地打造
      高质量、体验一致、符合设计规范的 Web 应用。
    </Paragraph>
  </div>
</div>
