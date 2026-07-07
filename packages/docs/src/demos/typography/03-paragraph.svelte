<script lang="ts">
  import { Paragraph, Title } from '@chenzy-design/svelte';
</script>

<div style="max-width: 480px;">
  <Paragraph>
    chenzy-design 是一套基于 Svelte 5 runes 构建的组件库，遵循 headless 与渲染分层的设计理念，
    提供一致的视觉语言与可访问性保障。
  </Paragraph>
  <Paragraph type="secondary" size="small">
    这是一段次要的小号说明文字，常用于辅助描述或注释信息。
  </Paragraph>

  <Title heading={5}>默认行距</Title>
  <Paragraph>
    chenzy-design 是一套基于 Svelte 5 runes 构建、遵循 headless 与渲染分层理念的组件库，
    帮助设计师与开发者更容易地打造高质量、体验一致、符合设计规范的 Web 应用。
  </Paragraph>

  <Title heading={5}>宽松行距</Title>
  <Paragraph spacing="extended">
    chenzy-design 是一套基于 Svelte 5 runes 构建、遵循 headless 与渲染分层理念的组件库，
    帮助设计师与开发者更容易地打造高质量、体验一致、符合设计规范的 Web 应用。
  </Paragraph>
</div>
