<script lang="ts">
  import { Typography, Tooltip } from '@chenzy-design/svelte';
  import type { Snippet } from 'svelte';

  const { Paragraph, Title, Text } = Typography;

  function handleExpand(expanded: boolean, e: MouseEvent): void {
    // eslint-disable-next-line no-console
    console.log('expanded:', expanded, e);
  }
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">
  <Title heading={5} ellipsis={{ showTooltip: true }} style="width: 250px;">
    这是一个很长很长很长很长很长的 5 号标题
  </Title>

  <Text ellipsis={{ showTooltip: { opts: { content: '这是自定义要展示的内容' } } }} style="width: 150px;">
    可以自定义浮层里的展示内容试试看吧
  </Text>

  <Text link ellipsis={{ showTooltip: true, pos: 'middle' }} style="width: 150px;">
    是一个很长很长很长很长的链接文本
  </Text>

  <Paragraph ellipsis={{ suffix: '小尾巴' }} style="width: 300px;">
    有后缀的情况：chenzy Design 是一套基于 Svelte 5 runes 构建、遵循 headless 与渲染分层理念的设计系统。
  </Paragraph>

  <Paragraph ellipsis={{ rows: 3 }} style="width: 300px;">
    这是一个多行截断的例子：chenzy Design 是一套基于 Svelte 5 runes 构建、遵循 headless 与渲染分层理念的设计系统。
    设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、
    用户体验一致的、符合设计规范的 Web 应用。
  </Paragraph>

  <Paragraph ellipsis={{ rows: 3, showTooltip: { type: 'popover' } }} style="width: 300px;">
    多行截断，展示 Popover：chenzy Design 是一套基于 Svelte 5 runes 构建、遵循 headless 与渲染分层理念的设计系统。
    设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、
    用户体验一致的、符合设计规范的 Web 应用。
  </Paragraph>

  <Paragraph
    ellipsis={{
      rows: 3,
      expandable: true,
      collapsible: true,
      collapseText: '折叠我吧',
      onExpand: handleExpand,
    }}
    style="width: 300px;"
  >
    支持展开和折叠：chenzy Design 是一套基于 Svelte 5 runes 构建、遵循 headless 与渲染分层理念的设计系统。
    设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、
    用户体验一致的、符合设计规范的 Web 应用。
  </Paragraph>

  <Title heading={5} ellipsis={{ showTooltip: { renderTooltip } }} style="width: 250px;">
    这是一个自定义弹出层组件的省略文本
  </Title>
</div>

{#snippet renderTooltip(fullText: string, trigger: Snippet)}
  <Tooltip content={`完整原文：${fullText}`}>
    {@render trigger()}
  </Tooltip>
{/snippet}
