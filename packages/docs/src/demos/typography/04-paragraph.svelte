<script lang="ts">
  import { Typography } from '@chenzy-design/svelte';

  const { Paragraph, Title } = Typography;
</script>

<div>
  <Title heading={5}>默认行距</Title>
  <Paragraph>
    chenzy Design 是一套基于 Svelte 5 runes 构建、遵循 headless 与渲染分层理念的设计系统。
    设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、
    用户体验一致的、符合设计规范的 Web 应用。
  </Paragraph>
  <br />
  <Title heading={5}>宽松行距</Title>
  <Paragraph spacing="extended">
    chenzy Design 是一套基于 Svelte 5 runes 构建、遵循 headless 与渲染分层理念的设计系统。
    设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、
    用户体验一致的、符合设计规范的 Web 应用。
  </Paragraph>
</div>
